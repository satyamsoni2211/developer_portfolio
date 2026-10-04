import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { projects } from '../src/data/projects'

const html = readFileSync('index.html', 'utf8')
const sitemap = readFileSync('public/sitemap.xml', 'utf8')

test('index.html carries title, 10+ description, OG and favicon', () => {
  expect(html).toContain('<title>Satyam Soni — Solution Architect</title>')
  expect(html).toMatch(/name="description" content="[^"]*10\+ years/)
  expect(html).toContain('property="og:image" content="https://www.satyamsoni.com/og.png"')
  expect(html).toContain('href="/favicon.svg"')
  expect(html).not.toContain('9+')
})

test('sitemap lists home and every project', () => {
  expect(sitemap).toContain('<loc>https://www.satyamsoni.com/</loc>')
  for (const p of projects) expect(sitemap).toContain(`<loc>https://www.satyamsoni.com/projects/${p.slug}</loc>`)
})
