// Builds layered character assets from the source SVG (raster PNG + luminance mask).
// All coordinates below are in source-image pixels (1792×2390), measured from the illustration.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const SRC = 'assets-src/character/character.svg'
const OUT = 'src/assets/character'
const FRAME = { left: 540, top: 210, width: 750, height: 2020 } // full figure + margin
const HEAD = { left: 780, top: 225, width: 270, height: 375 } // hair top → neck
const BODY_CUT_Y = 548 // body layer is transparent above this row (head layer covers it)
const HEAD_FEATHER = { from: 545, to: 572 } // head alpha fades out over the neck/collar
const BADGE = { left: 700, top: 225, width: 430, height: 430 } // head + shoulders for the round badge
const PIVOT = { x: 915, y: 580 } // neck — head rotation origin
const EYES = { left: { cx: 869, cy: 426 }, right: { cx: 957, cy: 426 }, rx: 20, ry: 6.5, irisR: 7.5, travelX: 9, travelY: 2.5 }
const SKIN_SAMPLE = { x: 915, y: 375, r: 3 } // forehead, between hairline and brows
const SCALES = { '1x': 0.32, '2x': 0.64 }

const svg = await readFile(SRC, 'utf8')
const pngs = [...svg.matchAll(/xlink:href="data:image\/png;base64,([^"]+)"/g)].map((m) => Buffer.from(m[1], 'base64'))
if (pngs.length !== 2) throw new Error(`Expected 2 embedded PNGs, found ${pngs.length}`)
const [maskPng, colorPng] = pngs // the <mask> image is declared first, inside <defs>

const color = await sharp(colorPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = color.info
const mask = await sharp(maskPng).flatten({ background: '#000' }).toColourspace('b-w').raw().toBuffer({ resolveWithObject: true })
if (mask.info.channels !== 1 || mask.info.width !== W || mask.info.height !== H) throw new Error('Unexpected mask format')

const rgba = Buffer.from(color.data)
for (let i = 0; i < W * H; i++) rgba[i * 4 + 3] = Math.round((rgba[i * 4 + 3] * mask.data[i]) / 255)
const cutout = () => sharp(rgba, { raw: { width: W, height: H, channels: 4 } })

const body = await cutout().extract(FRAME).raw().toBuffer()
for (let y = 0; y < BODY_CUT_Y - FRAME.top; y++) {
  for (let x = 0; x < FRAME.width; x++) body[(y * FRAME.width + x) * 4 + 3] = 0
}

const head = await cutout().extract(HEAD).raw().toBuffer()
const featherStart = HEAD_FEATHER.from - HEAD.top
for (let y = featherStart; y < HEAD.height; y++) {
  const t = Math.min(1, (y - featherStart) / (HEAD_FEATHER.to - HEAD_FEATHER.from))
  for (let x = 0; x < HEAD.width; x++) {
    const i = (y * HEAD.width + x) * 4 + 3
    head[i] = Math.round(head[i] * (1 - t))
  }
}

let r = 0, g = 0, b = 0, n = 0
for (let y = SKIN_SAMPLE.y - SKIN_SAMPLE.r; y <= SKIN_SAMPLE.y + SKIN_SAMPLE.r; y++) {
  for (let x = SKIN_SAMPLE.x - SKIN_SAMPLE.r; x <= SKIN_SAMPLE.x + SKIN_SAMPLE.r; x++) {
    const i = (y * W + x) * 4
    r += rgba[i]; g += rgba[i + 1]; b += rgba[i + 2]; n++
  }
}
const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0')
const skin = `#${hex(r)}${hex(g)}${hex(b)}`

await mkdir(OUT, { recursive: true })
const sizes = []
for (const [tag, s] of Object.entries(SCALES)) {
  for (const [name, buf, box] of [['body', body, FRAME], ['head', head, HEAD]]) {
    const file = `${OUT}/${name}-${tag}.webp`
    const info = await sharp(buf, { raw: { width: box.width, height: box.height, channels: 4 } })
      .resize(Math.round(box.width * s))
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toFile(file)
    sizes.push(`${file} ${info.width}×${info.height} ${(info.size / 1024).toFixed(1)} KB`)
  }
}

const inHead = (p) => ({ cx: p.cx - HEAD.left, cy: p.cy - HEAD.top })
const layout = {
  frame: { w: FRAME.width, h: FRAME.height },
  head: { x: HEAD.left - FRAME.left, y: HEAD.top - FRAME.top, w: HEAD.width, h: HEAD.height },
  badge: { x: BADGE.left - FRAME.left, y: BADGE.top - FRAME.top, w: BADGE.width, h: BADGE.height },
  pivot: { x: PIVOT.x - HEAD.left, y: PIVOT.y - HEAD.top },
  eyes: {
    left: inHead(EYES.left),
    right: inHead(EYES.right),
    rx: EYES.rx, ry: EYES.ry, irisR: EYES.irisR, travelX: EYES.travelX, travelY: EYES.travelY,
    skin, sclera: '#efe3d8', iris: '#4a3a2f', lid: '#2a1c15',
  },
}
await writeFile(`${OUT}/layout.json`, `${JSON.stringify(layout, null, 2)}\n`)

// Open Graph image: full figure on black with name and role.
const figure = await cutout().extract(FRAME).resize({ height: 600 }).png().toBuffer()
const figureW = Math.round((FRAME.width * 600) / FRAME.height)
const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="g" cx="80%" cy="20%" r="70%"><stop offset="0" stop-color="#2997ff" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g font-family="-apple-system, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif">
    <text x="80" y="270" font-size="92" font-weight="700" letter-spacing="-3" fill="#f5f5f7">Satyam Soni<tspan fill="#2997ff">.</tspan></text>
    <text x="80" y="340" font-size="36" fill="#a1a1a6">Solution Architect · 10+ years</text>
    <text x="80" y="392" font-size="28" fill="#a1a1a6">Data platforms · AI systems · Computer vision</text>
    <text x="80" y="560" font-size="24" fill="#2997ff">satyamsoni.com</text>
  </g>
</svg>`)
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#000000' } })
  .composite([{ input: text }, { input: figure, left: 1200 - 110 - figureW, top: 20 }])
  .png({ compressionLevel: 9 })
  .toFile('public/og.png')

console.log(sizes.join('\n'))
console.log(`skin ${skin}`)
