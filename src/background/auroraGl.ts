import type { Palette } from './palettes'

const VERT = `attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`

// Curtains of light: three noise-displaced ribbons with a sharp lower edge, a long upward fade and
// vertical "rays"; faint twinkling stars in dark mode.
const FRAG = `precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform float u_stars;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  float x = uv.x * aspect;
  float t = u_time * 0.035;
  vec3 col = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float base = 0.58 + 0.11 * fi;
    float wave = fbm(vec2(x * 0.8 + t * (1.0 + fi * 0.35) + fi * 3.7, t * 0.6 + fi * 1.3));
    float y = base + (wave - 0.5) * 0.42;
    float d = uv.y - y;
    float band = d < 0.0 ? exp(d * 26.0) : exp(-d * 5.5);
    float rays = 0.55 + 0.45 * noise(vec2(x * 22.0 + fi * 7.0, t * 3.0));
    vec3 c = i == 0 ? u_c0 : (i == 1 ? u_c1 : u_c2);
    col += c * band * rays * (0.8 - fi * 0.17);
  }
  col *= smoothstep(0.05, 0.5, uv.y);
  vec2 cell = floor(gl_FragCoord.xy);
  float star = step(0.9965, hash(cell)) * u_stars;
  float twinkle = 0.45 + 0.55 * sin(u_time * 1.7 + hash(cell + 3.1) * 40.0);
  col += vec3(star * twinkle * 0.9) * (1.0 - clamp(col.g + col.b, 0.0, 1.0));
  float alpha = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0);
  gl_FragColor = vec4(min(col, vec3(1.0)), alpha);
}`

export type AuroraRenderer = {
  setPalette: (p: Palette) => void
  setStars: (on: boolean) => void
  destroy: () => void
}

const SCALE = 0.5 // render at half resolution; the aurora is soft anyway
const FRAME_MS = 1000 / 30

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed')
  return s
}

/** Starts the aurora on `canvas`. Returns null when WebGL is unavailable. `onLost` fires on context loss. */
export function createAurora(canvas: HTMLCanvasElement, initial: Palette, onLost: () => void): AuroraRenderer | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true }) as WebGLRenderingContext | null
  if (!gl) return null

  let program: WebGLProgram
  try {
    program = gl.createProgram()!
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  } catch {
    return null
  }
  gl.useProgram(program)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(program, 'a_pos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  const u = (name: string) => gl.getUniformLocation(program, name)
  const uRes = u('u_res'), uTime = u('u_time'), uStars = u('u_stars')
  const uCols = [u('u_c0'), u('u_c1'), u('u_c2')]

  const current = initial.map((c) => [...c]) as Palette
  let target = initial
  let stars = 1
  let raf = 0
  let last = 0
  let prevFrame = performance.now()
  const start = prevFrame

  const resize = () => {
    const w = Math.max(1, Math.round(window.innerWidth * SCALE))
    const h = Math.max(1, Math.round(window.innerHeight * SCALE))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
  }

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (document.hidden || now - last < FRAME_MS) return
    last = now
    const dt = Math.min(0.1, (now - prevFrame) / 1000)
    prevFrame = now
    const k = 1 - Math.exp(-dt * 2.2) // ease palette toward the section's colours
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) current[i][j] += (target[i][j] - current[i][j]) * k
    resize()
    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uTime, (now - start) / 1000)
    gl.uniform1f(uStars, stars)
    current.forEach((c, i) => gl.uniform3f(uCols[i], c[0], c[1], c[2]))
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const lost = (e: Event) => {
    e.preventDefault()
    cancelAnimationFrame(raf)
    onLost()
  }
  canvas.addEventListener('webglcontextlost', lost)
  raf = requestAnimationFrame(frame)

  return {
    setPalette: (p) => {
      target = p
    },
    setStars: (on) => {
      stars = on ? 1 : 0
    },
    destroy: () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('webglcontextlost', lost)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
