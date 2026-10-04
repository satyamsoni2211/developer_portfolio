# Portfolio Revamp v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the terminal portfolio with an Apple-grade, animated, theme-aware portfolio for Satyam Soni, including 9 project case studies and a 2D cursor-following guide character built from Satyam's illustration.

**Architecture:** Vite + React 19 SPA. Typed content modules in `src/data/` feed section components on a single scrolling Home page; project case studies are a lazy route at `/projects/:slug` (React Router data router, View Transitions for card→hero morph). Motion drives all animation through motion values (no per-frame React renders). The guide character is a layered WebP cut-out (body + head) with code-drawn eyes, rendered in three modes: hero (full body), companion (cursor-trailing badge) and docked (touch/reduced motion).

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS 3, `react-router` 7, `motion` 12, `lenis` 1, Vitest 3 + Testing Library + jsdom, `sharp` (asset script only).

**Spec:** `docs/superpowers/specs/2026-10-04-portfolio-revamp-design.md`

## Global Constraints

- Branch: `feature/revamp-v2`. Commit after every task. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Deploy stays on existing GitHub Actions → Vercel; `vercel.json` unchanged. Vite `base` MUST be `'/'` (the current `'./'` breaks nested routes like `/projects/stryve` on refresh).
- Theme: follows OS live by default; toggle cycles System → Light → Dark; persisted in `localStorage` key `theme`; all storage access wrapped in try/catch.
- Colors exactly: Light `--bg #fbfbfd`, `--bg-elevated #ffffff`, `--fg #1d1d1f`, `--fg-muted #6e6e73`, `--accent #0071e3`; Dark `--bg #000000`, `--bg-elevated #1c1c1e`, `--fg #f5f5f7`, `--fg-muted #a1a1a6`, `--accent #2997ff`.
- Font: system stack only, no web-font downloads.
- Experience copy says **10+ years** (never "9+").
- Contact email `satyamsoni@hotmail.co.uk`; GitHub `https://github.com/satyamsoni2211`; LinkedIn `https://linkedin.com/in/-satyamsoni`; website `https://satyamsoni.in`. Phone never shown.
- Canonical site URL used in meta/sitemap: `https://www.satyamsoni.com` (from README "Live Demo").
- All animation via transform/opacity (filter blur only in reveal); under `prefers-reduced-motion` → 150 ms opacity fades only, no parallax, no Lenis, no cursor following.
- Initial JS ≤ ~150 KB gzip; character assets ≤ 150 KB total; Lighthouse mobile ≥ 95 all categories.
- Section ids: `hero`, `about`, `experience`, `projects`, `skills`, `education`, `contact`.
- Project slugs: `defect-detection`, `stryve`, `crickbuzz`, `fusion`, `html-parser`, `utility-framework`, `vendor-data-ingest`, `tool-suite`, `certificate-renewal` (this order).

**Deliberate refinements of the spec (approved scope, simpler mechanics):**
- Asset script is Node + `sharp` (`scripts/build-character.mjs`) instead of Python (Pillow is not installed).
- No separate `shoulders` asset: the companion badge renders the same body+head stack inside a circular, zoomed viewport defined by `layout.badge`.
- Eyes are not painted into the bitmap; an SVG overlay clipped to each eye's almond covers the original eye and draws sclera, a moving iris and blink lids.
- Hero → companion "morph": the companion spawns at the hero head's last on-screen rect and springs to the cursor (cross-section `layoutId` would animate from off-screen).
- Skills gain the technologies evidenced by the freelance projects (Rust, Tauri, Celery, OpenCV, Ultralytics YOLO, MediaPipe, SQLite, SQS).

## Review Focus

1. **Hard refresh / deep link on `/projects/<slug>`** must load (absolute asset URLs). Pinned in Task 1 Step 9 (`dist/index.html` must reference `/assets/`).
2. **Storage blocked** (Safari private mode, blocked cookies): `localStorage`/`sessionStorage` throw → app still renders, theme falls back to system, guide visible. Pinned in Task 3 (readPref) and Task 14 (GuideProvider with throwing storage).
3. **Touch / no fine pointer**: no cursor following; docked badge appears and opens the menu. Pinned in Task 14 (docked test).
4. **Unknown routes**: `/projects/nope` and `/anything` render the 404 page with a way home, not a blank screen. Pinned in Task 5.
5. **Content never stuck invisible**: revealed content must end at opacity 1 once in view (an IntersectionObserver-driven reveal that never fires would hide the whole site). Pinned in Task 4 (Reveal test).

---

## File Structure

```
index.html                         rewritten: meta, no-flash theme script
public/favicon.svg, robots.txt, sitemap.xml, og.png (generated)
scripts/build-character.mjs        asset pipeline (sharp)
assets-src/character/character.svg source illustration (not shipped)
src/
  main.tsx                         providers + RouterProvider
  AppProviders.tsx                 Theme + Toast + MotionConfig
  routes.tsx                       route objects (shared by app + tests)
  index.css                        tokens, base, utilities, keyframes
  data/  types.ts profile.ts experience.ts projects.ts skills.ts education.ts sections.ts data.test.ts
  theme/ theme.ts ThemeProvider.tsx ThemeToggle.tsx motion.ts theme.test.ts(x)
  lib/   utils.ts storage.ts clipboard.ts scroll.ts useActiveSection.ts useDocumentMeta.ts useMediaQuery.ts graph.ts graph.test.ts lib.test.ts
  components/ Reveal.tsx CountUp.tsx Section.tsx Button.ts Tag.tsx Toast.tsx icons.tsx SocialLinks.tsx Nav.tsx Footer.tsx
              ProjectCover.tsx ProjectCard.tsx ArchitectureDiagram.tsx components.test.tsx
  sections/ Hero.tsx About.tsx Experience.tsx Projects.tsx Skills.tsx Education.tsx Contact.tsx sections.test.tsx
  pages/  RootLayout.tsx Home.tsx ProjectPage.tsx NotFound.tsx RouteError.tsx routes.test.tsx
  guide/  geometry.ts tips.ts character.ts Character.tsx Badge.tsx SpeechBubble.tsx GuideProvider.tsx
          HeroCharacter.tsx Companion.tsx Docked.tsx GuideMenu.tsx GuideLayer.tsx guide.test.ts guide.test.tsx
  assets/character/ body-1x.webp body-2x.webp head-1x.webp head-2x.webp layout.json (generated)
  test/   setup.ts render.tsx
```

---

### Task 1: Clean slate, tooling and design tokens

**Files:**
- Delete: `src/App.tsx`, `src/App.css`, `src/components/ui/` (all), `src/hooks/use-mobile.ts`, `components.json`, `netlify.toml`, `thumbnails/`
- Modify: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `tailwind.config.js`, `src/index.css`, `src/main.tsx`, `.github/workflows/vercel.yml`
- Create: `src/AppProviders.tsx` (temporary minimal), `src/test/setup.ts`, `src/smoke.test.tsx`

**Interfaces:**
- Produces: Tailwind colors `bg`, `elevated`, `fg`, `muted`, `accent` (alpha-capable), `line`; font sizes `text-display`, `text-title`; utilities `.glass`, `.card`, `.animate-breathe`, `.marquee-track`; `npm test`.

- [ ] **Step 1: Remove old code and unused dependencies**

```bash
git rm -rq src/App.tsx src/App.css src/components/ui src/hooks/use-mobile.ts components.json netlify.toml thumbnails
npm uninstall @hookform/resolvers @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip class-variance-authority cmdk date-fns embla-carousel-react input-otp next-themes react-day-picker react-hook-form react-resizable-panels recharts sonner vaul zod kimi-plugin-inspect-react tailwindcss-animate tw-animate-css
npm install motion react-router lenis
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom sharp
```

- [ ] **Step 2: Add scripts to `package.json`**

In `"scripts"` add:

```json
"test": "vitest run",
"test:watch": "vitest",
"assets": "node scripts/build-character.mjs"
```

- [ ] **Step 3: Replace `vite.config.ts`**

```ts
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

- [ ] **Step 4: Enable JSON imports**

In `tsconfig.app.json` `compilerOptions` add `"resolveJsonModule": true,` after `"moduleDetection": "force",`.

- [ ] **Step 5: Replace `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--fg-muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(3.25rem, 9vw, 6.5rem)', { lineHeight: '1', letterSpacing: '-0.035em' }],
        title: ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: 251 251 253;
  --bg-elevated: 255 255 255;
  --fg: 29 29 31;
  --fg-muted: 110 110 115;
  --accent: 0 113 227;
  --line: rgba(0, 0, 0, 0.08);
  --glass: rgba(251, 251, 253, 0.72);
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 10px 30px rgba(0, 0, 0, 0.06);
  color-scheme: light;
}

:root[data-theme='dark'] {
  --bg: 0 0 0;
  --bg-elevated: 28 28 30;
  --fg: 245 245 247;
  --fg-muted: 161 161 166;
  --accent: 41 151 255;
  --line: rgba(255, 255, 255, 0.12);
  --glass: rgba(22, 22, 23, 0.72);
  --shadow: none;
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --bg: 0 0 0;
    --bg-elevated: 28 28 30;
    --fg: 245 245 247;
    --fg-muted: 161 161 166;
    --accent: 41 151 255;
    --line: rgba(255, 255, 255, 0.12);
    --glass: rgba(22, 22, 23, 0.72);
    --shadow: none;
    color-scheme: dark;
  }
}

@layer base {
  html {
    background: rgb(var(--bg));
    -webkit-text-size-adjust: 100%;
  }
  body {
    @apply bg-bg font-sans text-fg antialiased;
    font-size: 17px;
    line-height: 1.5;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  section[id] {
    scroll-margin-top: 72px;
  }
  ::selection {
    background: rgb(var(--accent) / 0.25);
  }
}

@layer components {
  .glass {
    background: var(--glass);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
  }
  .card {
    @apply rounded-[28px] border border-line bg-elevated;
    box-shadow: var(--shadow);
  }
}

@layer utilities {
  .animate-breathe {
    animation: breathe 4s ease-in-out infinite;
    transform-origin: 50% 100%;
  }
  .marquee-track {
    animation: marquee 40s linear infinite;
  }
  .marquee:hover .marquee-track {
    animation-play-state: paused;
  }
}

@keyframes breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.01); }
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

::view-transition-group(*) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .animate-breathe,
  .marquee-track {
    animation: none;
  }
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 7: Test setup, temporary providers and smoke test**

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

class MockIntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
Element.prototype.scrollIntoView = vi.fn()

if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}
```

`src/AppProviders.tsx` (replaced in Task 3/4):

```tsx
import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'

export function AppProviders({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
```

`src/main.tsx` (replaced in Task 5):

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProviders } from './AppProviders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <main id="main" className="p-8">
        <h1 className="text-display font-semibold">Satyam Soni</h1>
      </main>
    </AppProviders>
  </StrictMode>,
)
```

`src/smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { AppProviders } from './AppProviders'

test('providers render children', () => {
  render(
    <AppProviders>
      <p>hello</p>
    </AppProviders>,
  )
  expect(screen.getByText('hello')).toBeInTheDocument()
})
```

- [ ] **Step 8: Production deploys only from `main` pushes**

In `.github/workflows/vercel.yml`, add an `if` to the deploy step so PRs only build:

```yaml
      - uses: amondnet/vercel-action@v25 # deploy
        if: github.event_name == 'push'
        with:
```

- [ ] **Step 9: Verify tests, build, and absolute asset URLs**

Run: `npm test && npm run build && grep -c 'src="/assets/' dist/index.html`
Expected: 1 test passes; build succeeds; grep prints `1` (absolute `/assets/` path → deep links work).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: clear terminal UI, add motion/router/lenis/vitest and design tokens"
```

---

### Task 2: Typed content data

**Files:**
- Create: `src/data/types.ts`, `src/data/profile.ts`, `src/data/experience.ts`, `src/data/education.ts`, `src/data/skills.ts`, `src/data/projects.ts`, `src/data/sections.ts`
- Test: `src/data/data.test.ts`

**Interfaces:**
- Produces:
  - `type Metric = { value: number; prefix?: string; suffix?: string; label: string } | { text: string; label: string }`
  - `type CoverVariant = 'gear' | 'pose' | 'pitch' | 'graph' | 'brackets' | 'layers' | 'pipeline' | 'grid' | 'certificate'`
  - `type ArchNode = { id: string; label: string; sub?: string; kind: 'client' | 'service' | 'store' | 'device' | 'model' }`
  - `type ArchEdge = { from: string; to: string; label?: string; bidirectional?: boolean }`
  - `type Architecture = { nodes: ArchNode[]; edges: ArchEdge[] }`
  - `type Project` (below), `type Job`, `type SkillCategory`
  - `profile`, `experience: Job[]`, `education`, `skillCategories: SkillCategory[]`, `marqueeSkills: string[]`, `projects: Project[]`, `SECTIONS`, `SECTION_IDS`, `NAV_SECTIONS`

- [ ] **Step 1: Write the failing test** — `src/data/data.test.ts`

```ts
import { describe, expect, test } from 'vitest'
import { education } from './education'
import { experience } from './experience'
import { profile } from './profile'
import { projects } from './projects'
import { SECTION_IDS } from './sections'
import { skillCategories } from './skills'

describe('content data', () => {
  test('has 9 projects in the agreed order with unique slugs', () => {
    expect(projects.map((p) => p.slug)).toEqual([
      'defect-detection', 'stryve', 'crickbuzz', 'fusion', 'html-parser',
      'utility-framework', 'vendor-data-ingest', 'tool-suite', 'certificate-renewal',
    ])
  })

  test('first three projects are freelance, the rest enterprise', () => {
    expect(projects.slice(0, 3).every((p) => p.kind === 'freelance')).toBe(true)
    expect(projects.slice(3).every((p) => p.kind === 'enterprise' && p.company)).toBe(true)
  })

  test('every project has cover, tech, tagline and at least one metric', () => {
    for (const p of projects) {
      expect(p.cover, p.slug).toBeTruthy()
      expect(p.tech.length, p.slug).toBeGreaterThan(0)
      expect(p.tagline.length, p.slug).toBeGreaterThan(10)
      expect(p.metrics.length, p.slug).toBeGreaterThan(0)
    }
  })

  test('architecture edges reference existing nodes', () => {
    for (const p of projects) {
      if (!p.architecture) continue
      const ids = new Set(p.architecture.nodes.map((n) => n.id))
      for (const e of p.architecture.edges) {
        expect(ids.has(e.from), `${p.slug}: ${e.from}`).toBe(true)
        expect(ids.has(e.to), `${p.slug}: ${e.to}`).toBe(true)
      }
    }
  })

  test('freelance projects carry their services and models', () => {
    const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]))
    expect(bySlug['defect-detection'].services.map((s) => s.name)).toEqual(['Camera Service', 'Defect Backend', 'Defect Dashboard'])
    expect(bySlug['stryve'].services.map((s) => s.name)).toEqual(['Stryve Backend', 'Pose Extraction Service'])
    expect(bySlug['crickbuzz'].services.map((s) => s.name)).toEqual(['Extraction Service'])
    expect(bySlug['defect-detection'].models).toEqual(['YOLO11s'])
    expect(bySlug['crickbuzz'].models).toEqual(['YOLO26 (custom-trained)'])
  })

  test('5 jobs newest first, 8 skill categories, education present', () => {
    expect(experience.map((j) => j.company)).toEqual([
      'SenecaGlobal Solutions Pvt Ltd.', 'HSBC Software Development (India) Pvt. Ltd.',
      'Infosys Ltd', 'Amdocs Development Centre India LLP', 'Gemini Solutions Pvt Ltd.',
    ])
    expect(skillCategories).toHaveLength(8)
    expect(education.school).toBe('Chamelidevi School of Engineering')
  })

  test('copy says 10+ years and never 9+', () => {
    const text = JSON.stringify({ profile, experience, projects })
    expect(text).toContain('10+ years')
    expect(text).not.toContain('9+')
  })

  test('section ids are fixed', () => {
    expect(SECTION_IDS).toEqual(['hero', 'about', 'experience', 'projects', 'skills', 'education', 'contact'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data`
Expected: FAIL — cannot resolve `./education` etc.

- [ ] **Step 3: Write `src/data/types.ts`**

```ts
export type Metric =
  | { value: number; prefix?: string; suffix?: string; label: string }
  | { text: string; label: string }

export type CoverVariant =
  | 'gear' | 'pose' | 'pitch' | 'graph' | 'brackets' | 'layers' | 'pipeline' | 'grid' | 'certificate'

export type ArchNode = {
  id: string
  label: string
  sub?: string
  kind: 'client' | 'service' | 'store' | 'device' | 'model'
}

export type ArchEdge = { from: string; to: string; label?: string; bidirectional?: boolean }

export type Architecture = { nodes: ArchNode[]; edges: ArchEdge[] }

export type Service = { name: string; description: string; points?: string[] }

export type Project = {
  slug: string
  name: string
  tagline: string
  kind: 'freelance' | 'enterprise'
  company?: string
  industry: string
  role: string
  summary: string
  problem?: string
  solution?: string
  services: Service[]
  models?: string[]
  tech: string[]
  metrics: Metric[]
  architecture?: Architecture
  cover: CoverVariant
}

export type Job = {
  company: string
  location: string
  role: string
  period: string
  description: string
  technologies: string[]
}

export type SkillCategory = { id: string; label: string; items: string[] }
```

- [ ] **Step 4: Write `src/data/profile.ts`**

```ts
export const profile = {
  name: 'Satyam Soni',
  role: 'Technical Architect',
  location: 'Indore, Madhya Pradesh',
  email: 'satyamsoni@hotmail.co.uk',
  github: 'https://github.com/satyamsoni2211',
  linkedin: 'https://linkedin.com/in/-satyamsoni',
  website: 'https://satyamsoni.in',
  pitch: 'I design data platforms, AI systems and the teams that ship them.',
  metaDescription:
    'Satyam Soni is a Technical Architect with 10+ years of experience building data platforms, AI/LLM systems and computer-vision products across finance, telecom, real estate and manufacturing.',
  bio: [
    'Results-driven Technology Specialist with 10+ years of experience delivering data-centric solutions, driving software development, and implementing ETL pipelines and platform integration solutions to unlock scale across the finance, telecom, and real estate industries.',
    'Proven expertise in Artificial Intelligence (AI) and Large Language Models (LLMs), leveraging cutting-edge techniques to develop intelligent solutions. Adept at establishing collaboration frameworks for internal teams, building strong relationships with stakeholders, and recommending process improvements to optimize workflows.',
    'Passionate about innovation and building solutions that empower internal and external stakeholders.',
  ],
  pillars: [
    { title: 'Data & Platforms', body: 'ETL pipelines on Airflow, cloud-native microservices on AWS, and integrations that unlock scale.' },
    { title: 'AI & LLMs', body: 'GraphRAG chatbots, GPT-4o extraction pipelines and computer-vision systems running in production.' },
    { title: 'Leadership', body: 'Sprint planning, architecture direction and hands-on technical guidance for teams of 10+ developers.' },
  ],
  industries: ['Finance', 'Telecom', 'Real Estate', 'Manufacturing', 'Fitness', 'Sports'],
  contactBlurb: 'Feel free to reach out for collaboration, consulting, or just to chat about AI and architecture!',
  resumeNote: 'Résumé available on request.',
} as const
```

- [ ] **Step 5: Write `src/data/experience.ts`** (descriptions verbatim from the old `PORTFOLIO_DATA`)

```ts
import type { Job } from './types'

export const experience: Job[] = [
  {
    company: 'SenecaGlobal Solutions Pvt Ltd.',
    location: 'Hyderabad, Telangana',
    role: 'Technical Architect – Real Estate, Finance',
    period: 'Jan 2022 – Present',
    description:
      'Led the development and integration of microservices using Python (FastAPI, Flask) on AWS, enhancing platform scalability. Designed ETL workflows using Airflow to ingest data from various vendors. Spearheaded development of "Fusion," an AI-powered chatbot using GraphRAG for knowledge graph interaction. Leveraged GPT-4o to automate content extraction from HTML files, improving efficiency by 50%. Implemented micro-frontend architecture and streamlined deployment using Docker and ECS, reducing deployment time by 30%. Directed sprint planning and provided technical guidance to a team of 10+ developers.',
    technologies: ['Python', 'FastAPI', 'Flask', 'AWS', 'Airflow', 'GraphRAG', 'GPT-4o', 'Docker', 'ECS', 'React', 'Vue.js'],
  },
  {
    company: 'HSBC Software Development (India) Pvt. Ltd.',
    location: 'Pune, Maharashtra',
    role: 'Senior Software Engineer – Finance, R&D',
    period: 'Jan 2020 – Jan 2022',
    description:
      'Developed scalable Full-Stack solutions using Python (Django, Flask) and ReactJS, deployed on ECS. Built microservices for automation using Golang, boosting performance by 30%. Collaborated with distributed team of 10+ developers using Agile and Kanban. Automated testing and monitoring processes, reducing incidents by 15%. Designed fault-tolerant cloud-native architectures on AWS. Conducted knowledge-sharing sessions on Python automation tools, improving team productivity by 15%.',
    technologies: ['Python', 'Django', 'Flask', 'ReactJS', 'Golang', 'AWS', 'ECS', 'Docker'],
  },
  {
    company: 'Infosys Ltd',
    location: 'Pune, Maharashtra',
    role: 'Associate Consultant – Investment Banking, Finance',
    period: 'Jan 2019 – Dec 2019',
    description:
      'Built full-stack applications using Python (Django, Flask) and ReactJS, enhancing data processing efficiency by 40%. Developed REST APIs and integrated dynamic frontend components using Angular and React. Created Python-based machine learning pipelines for data analytics. Automated backend testing with Python, reducing bugs in production by 15%.',
    technologies: ['Python', 'Django', 'Flask', 'ReactJS', 'Angular', 'REST APIs', 'Machine Learning'],
  },
  {
    company: 'Amdocs Development Centre India LLP',
    location: 'Pune, Maharashtra',
    role: 'Front End Developer – Telecom',
    period: 'Aug 2018 – Jan 2019',
    description:
      'Developed reusable ReactJS components and integrated them with Python-based REST APIs (Flask, Django). Enhanced frontend performance by 25% through optimized React development. Conducted frontend testing using Mocha and Chai to ensure high code quality. Collaborated with backend teams to resolve technical issues.',
    technologies: ['ReactJS', 'Flask', 'Django', 'REST APIs', 'Mocha', 'Chai'],
  },
  {
    company: 'Gemini Solutions Pvt Ltd.',
    location: 'Gurugram, Haryana',
    role: 'ETL DevOps Developer – Finance/Banking',
    period: 'Jul 2016 – Apr 2018',
    description:
      'Automated ETL processes using Python and Shell scripting, reducing manual data handling by 50%. Developed Python frameworks for data validation and scraping. Integrated ETL systems with ReactJS frontends for real-time insights. Optimized data extraction workflows, improving processing times by 30%.',
    technologies: ['Python', 'Shell Scripting', 'ETL', 'ReactJS', 'Data Validation'],
  },
]
```

- [ ] **Step 6: Write `src/data/education.ts`**

```ts
export const education = {
  degree: 'Bachelor of Engineering in Computer Science',
  school: 'Chamelidevi School of Engineering',
  location: 'Indore, Madhya Pradesh',
  period: 'Jan 2012 – Jun 2016',
  gpa: '75/100',
} as const
```

- [ ] **Step 7: Write `src/data/skills.ts`**

```ts
import type { SkillCategory } from './types'

export const skillCategories: SkillCategory[] = [
  { id: 'languages', label: 'Programming Languages', items: ['Python', 'Golang', 'C#', 'TypeScript', 'NodeJS', 'Rust', 'Shell Scripting', 'SQL'] },
  { id: 'frameworks', label: 'Frameworks & Libraries', items: ['Django', 'FastAPI', 'Flask', 'PySpark', 'ReactJS', 'Angular', 'Vue.js', '.Net Core', 'Gin', 'Gorm', 'GRPC', 'Tauri', 'Celery'] },
  { id: 'ai_ml', label: 'AI / ML', items: ['Scikit-learn', 'NumPy', 'Pandas', 'PyTorch', 'LangChain', 'OpenAI', 'GraphRAG', 'LLM Integration', 'OpenCV', 'Ultralytics YOLO', 'MediaPipe'] },
  { id: 'databases', label: 'Databases', items: ['MySQL', 'MongoDB', 'PostgreSQL', 'Elasticsearch', 'Redis', 'SQLite', 'Neo4j'] },
  { id: 'devops', label: 'DevOps & Tools', items: ['Docker', 'Kubernetes', 'Terraform', 'Apache Airflow', 'MWAA', 'Swagger'] },
  { id: 'cloud', label: 'Cloud Technologies', items: ['AWS (EC2, S3, RDS, Lambda)', 'ECS', 'SQS', 'Cloud-Native Architecture'] },
  { id: 'tools', label: 'Version Control & Tools', items: ['GIT', 'BitBucket', 'JIRA', 'Confluence', 'SharePoint'] },
  { id: 'os', label: 'Operating Systems', items: ['Windows', 'Linux', 'Unix', 'Mac'] },
]

export const marqueeSkills = [
  'Python', 'FastAPI', 'Golang', 'React', 'TypeScript', 'PyTorch', 'LangChain', 'GraphRAG', 'OpenCV',
  'YOLO', 'MediaPipe', 'AWS', 'Kubernetes', 'Terraform', 'Airflow', 'PostgreSQL', 'Docker', 'Rust',
]
```

- [ ] **Step 8: Write `src/data/sections.ts`**

```ts
export const SECTIONS = [
  { id: 'about', label: 'About', nav: true },
  { id: 'experience', label: 'Experience', nav: true },
  { id: 'projects', label: 'Projects', nav: true },
  { id: 'skills', label: 'Skills', nav: true },
  { id: 'education', label: 'Education', nav: false },
  { id: 'contact', label: 'Contact', nav: true },
] as const

export type SectionId = 'hero' | (typeof SECTIONS)[number]['id']

export const SECTION_IDS: SectionId[] = ['hero', ...SECTIONS.map((s) => s.id)]

export const NAV_SECTIONS = SECTIONS.filter((s) => s.nav)
```

- [ ] **Step 9: Write `src/data/projects.ts`**

```ts
import type { Project } from './types'

export const projects: Project[] = [
  {
    slug: 'defect-detection',
    name: 'Defect Detection',
    tagline: 'Vision-based defect analysis for differential gears.',
    kind: 'freelance',
    industry: 'Manufacturing',
    role: 'Solo developer',
    summary:
      'An in-house inspection system that photographs differential gears with high-resolution cameras, runs a YOLO11s detector and gives the operator an annotated pass/fail verdict in under five seconds.',
    problem:
      'A mechanical manufacturer needed reliable, repeatable defect analysis for differential gears — fast enough for the shop floor and without recurring cloud costs.',
    solution:
      'Three cooperating services: a camera service on Raspberry Pi that drives 64 MP cameras and reports their health, a FastAPI backend that orchestrates each inspection and annotates defects with a YOLO11s model, and a Tauri desktop dashboard where operators trigger runs, read verdicts and browse past inspections.',
    services: [
      {
        name: 'Camera Service',
        description: 'Captures images from 64 MP Arduino cameras attached to Raspberry Pi devices.',
        points: ['High-resolution capture on demand', 'Health status reporting for every camera'],
      },
      {
        name: 'Defect Backend',
        description: 'Core of the product: owns the inspection workflow end to end.',
        points: ['Orchestrates the Camera Service', 'Runs YOLO11s analysis and annotates defects', 'Persists inspections and verdicts to SQLite'],
      },
      {
        name: 'Defect Dashboard',
        description: 'Operator desktop app built with Tauri and React.',
        points: ['Trigger inspection workflows', 'See verdicts with annotated images', 'Browse historical inspections'],
      },
    ],
    models: ['YOLO11s'],
    tech: ['FastAPI', 'Ultralytics', 'PyTorch', 'OpenCV', 'Rust', 'Tauri', 'React', 'SQLite'],
    metrics: [
      { value: 97, suffix: '%', label: 'detection accuracy' },
      { value: 5, prefix: '≤ ', suffix: ' s', label: 'end-to-end inspection' },
      { text: 'In-house', label: 'deployment with regular backups — no cloud bill' },
    ],
    architecture: {
      nodes: [
        { id: 'dash', label: 'Defect Dashboard', sub: 'Tauri · React', kind: 'client' },
        { id: 'backend', label: 'Defect Backend', sub: 'FastAPI', kind: 'service' },
        { id: 'camsvc', label: 'Camera Service', sub: 'Raspberry Pi', kind: 'service' },
        { id: 'yolo', label: 'YOLO11s', sub: 'Ultralytics', kind: 'model' },
        { id: 'db', label: 'SQLite', sub: 'inspections', kind: 'store' },
        { id: 'cams', label: '64 MP cameras', sub: 'Arduino', kind: 'device' },
      ],
      edges: [
        { from: 'dash', to: 'backend', label: 'trigger · verdicts', bidirectional: true },
        { from: 'backend', to: 'camsvc', label: 'capture', bidirectional: true },
        { from: 'backend', to: 'yolo', label: 'inference' },
        { from: 'backend', to: 'db', label: 'results' },
        { from: 'camsvc', to: 'cams', label: 'control · health' },
      ],
    },
    cover: 'gear',
  },
  {
    slug: 'stryve',
    name: 'Stryve',
    tagline: "Guided workouts that check your pose against your trainer's.",
    kind: 'freelance',
    industry: 'Fitness',
    role: 'Lead developer',
    summary:
      "A guided-workout platform where trainees follow a trainer's recorded movements and get their posture checked against the trainer's pose.",
    problem: "Trainees working out on their own can't tell whether their form matches the trainer's.",
    solution:
      'Trainer videos are uploaded through the Stryve backend; a Celery-based extraction service runs MediaPipe pose estimation concurrently, stores pose keypoints as JSON on S3 and generates a 3D motion-coordinate file that drives a 3D animation of the trainer. Role-based access and course subscriptions are built into the API.',
    services: [
      {
        name: 'Stryve Backend',
        description: 'FastAPI service behind every app screen.',
        points: ['Video upload', 'RBAC for admin, trainer and trainee', 'Subscription-based courses'],
      },
      {
        name: 'Pose Extraction Service',
        description: 'Core pipeline of the product, running on Celery workers.',
        points: ['Google MediaPipe pose extraction', 'Pose JSON saved to S3', '3D motion-coordinate file to animate the trainer in 3D', 'Threaded runs for concurrent extraction'],
      },
    ],
    models: ['Google MediaPipe Pose'],
    tech: ['FastAPI', 'PyTorch', 'OpenCV', 'MediaPipe', 'Celery', 'PostgreSQL', 'AWS S3', 'AWS ECS', 'AWS SQS', 'AWS RDS'],
    metrics: [{ value: 95, suffix: '%', label: 'pose accuracy' }],
    architecture: {
      nodes: [
        { id: 'apps', label: 'Trainer & trainee apps', kind: 'client' },
        { id: 'backend', label: 'Stryve Backend', sub: 'FastAPI · RBAC', kind: 'service' },
        { id: 'rds', label: 'PostgreSQL', sub: 'AWS RDS', kind: 'store' },
        { id: 'sqs', label: 'Job queue', sub: 'AWS SQS', kind: 'store' },
        { id: 'pose', label: 'Pose Extraction', sub: 'Celery on ECS', kind: 'service' },
        { id: 'mp', label: 'MediaPipe Pose', kind: 'model' },
        { id: 's3', label: 'S3', sub: 'videos · pose JSON · 3D motion', kind: 'store' },
      ],
      edges: [
        { from: 'apps', to: 'backend', label: 'REST', bidirectional: true },
        { from: 'backend', to: 'rds' },
        { from: 'backend', to: 'sqs', label: 'enqueue' },
        { from: 'sqs', to: 'pose', label: 'consume' },
        { from: 'pose', to: 'mp', label: 'keypoints' },
        { from: 'pose', to: 's3', label: 'write' },
      ],
    },
    cover: 'pose',
  },
  {
    slug: 'crickbuzz',
    name: 'CrickBuzz',
    tagline: 'Ball-trajectory extraction from cricket net-practice videos.',
    kind: 'freelance',
    industry: 'Sports analytics',
    role: 'Solo developer',
    summary:
      'A computer-vision pipeline that extracts the full ball trajectory from net-practice videos, for analysis and for building 3D replays in Unity.',
    problem: 'A small, fast ball is easily lost between frames, leaving gaps that break downstream analysis and 3D reconstruction.',
    solution:
      'A custom-trained YOLO26 model detects the ball frame by frame; EMA smoothing removes jitter and backfilling reconstructs frames the detector missed, producing a complete trajectory stored in PostgreSQL and consumed by Unity to build 3D replays.',
    services: [
      {
        name: 'Extraction Service',
        description: 'Tracks the ball through every frame and emits a complete trajectory.',
        points: ['Custom-trained YOLO26 ball detector', 'EMA smoothing of the track', 'Backfill for missed frames', 'Output feeds analysis and Unity 3D replays'],
      },
    ],
    models: ['YOLO26 (custom-trained)'],
    tech: ['PyTorch', 'OpenCV', 'Ultralytics', 'PostgreSQL'],
    metrics: [{ value: 97, suffix: '%', label: 'tracking accuracy' }],
    architecture: {
      nodes: [
        { id: 'video', label: 'Net-practice video', kind: 'device' },
        { id: 'ext', label: 'Extraction Service', sub: 'EMA · backfill', kind: 'service' },
        { id: 'yolo', label: 'YOLO26', sub: 'custom-trained', kind: 'model' },
        { id: 'pg', label: 'PostgreSQL', sub: 'trajectories', kind: 'store' },
        { id: 'unity', label: 'Unity 3D replays', kind: 'client' },
      ],
      edges: [
        { from: 'video', to: 'ext', label: 'frames' },
        { from: 'ext', to: 'yolo', label: 'detect' },
        { from: 'ext', to: 'pg', label: 'trajectory' },
        { from: 'pg', to: 'unity' },
      ],
    },
    cover: 'pitch',
  },
  {
    slug: 'fusion',
    name: 'FUSION',
    tagline: 'GraphRAG chatbot that answers real-estate questions from a knowledge graph.',
    kind: 'enterprise',
    company: 'SenecaGlobal',
    industry: 'Real Estate',
    role: 'Technical Architect',
    summary:
      'AI-powered chatbot for real estate queries utilizing GraphRAG and entity disambiguation to resolve queries into Cypher text and generate accurate responses. Increased response accuracy by 25% and decreased query resolution time by 30%, leading to 20% increase in client retention.',
    services: [],
    tech: ['Python', 'GraphRAG', 'LLM', 'Neo4j', 'Cypher', 'FastAPI'],
    metrics: [
      { value: 25, prefix: '+', suffix: '%', label: 'response accuracy' },
      { value: 30, prefix: '−', suffix: '%', label: 'query resolution time' },
      { value: 20, prefix: '+', suffix: '%', label: 'client retention' },
    ],
    architecture: {
      nodes: [
        { id: 'user', label: 'Client query', kind: 'client' },
        { id: 'api', label: 'Fusion API', sub: 'FastAPI', kind: 'service' },
        { id: 'dis', label: 'Entity disambiguation', kind: 'service' },
        { id: 'llm', label: 'LLM · GraphRAG', sub: 'text → Cypher', kind: 'model' },
        { id: 'neo', label: 'Neo4j', sub: 'knowledge graph', kind: 'store' },
      ],
      edges: [
        { from: 'user', to: 'api', bidirectional: true },
        { from: 'api', to: 'dis' },
        { from: 'dis', to: 'llm' },
        { from: 'llm', to: 'neo', label: 'Cypher' },
      ],
    },
    cover: 'graph',
  },
  {
    slug: 'html-parser',
    name: 'HTML Parser and Extractor',
    tagline: 'GPT-4o turns messy HTML into structured data.',
    kind: 'enterprise',
    company: 'SenecaGlobal',
    industry: 'Real Estate & Finance',
    role: 'Technical Architect',
    summary:
      'Python-based tool for parsing and extracting structured data from HTML documents using GPT-4o model. Increased data processing speed by 30% and reduced manual extraction efforts by 40%. Successfully deployed in 15 client projects.',
    services: [],
    tech: ['Python', 'GPT-4o', 'LLM', 'HTML Parsing', 'FastAPI'],
    metrics: [
      { value: 30, prefix: '+', suffix: '%', label: 'processing speed' },
      { value: 40, prefix: '−', suffix: '%', label: 'manual extraction' },
      { value: 15, label: 'client projects' },
    ],
    cover: 'brackets',
  },
  {
    slug: 'utility-framework',
    name: 'Utility Framework',
    tagline: 'One Python framework for logging, Terraform, Docker and notifications.',
    kind: 'enterprise',
    company: 'SenecaGlobal',
    industry: 'Platform engineering',
    role: 'Technical Architect',
    summary:
      'Centralized Python framework for managing logging, Terraform, Docker, and notifications. Reduced downtime by 40% and increased deployment speed by 30%. Enhanced team collaboration with notification integrations.',
    services: [],
    tech: ['Python', 'Terraform', 'Docker', 'AWS', 'FastAPI'],
    metrics: [
      { value: 40, prefix: '−', suffix: '%', label: 'downtime' },
      { value: 30, prefix: '+', suffix: '%', label: 'deployment speed' },
    ],
    cover: 'layers',
  },
  {
    slug: 'vendor-data-ingest',
    name: 'Vendor Data Ingest',
    tagline: 'Automated vendor data pipelines on Airflow and AWS.',
    kind: 'enterprise',
    company: 'SenecaGlobal',
    industry: 'Real Estate & Finance',
    role: 'Technical Architect',
    summary: 'Automated data ingestion pipeline using Apache Airflow and AWS services, cutting down manual data entry by 60%.',
    services: [],
    tech: ['Python', 'Apache Airflow', 'AWS', 'MWAA', 'ETL'],
    metrics: [{ value: 60, prefix: '−', suffix: '%', label: 'manual data entry' }],
    architecture: {
      nodes: [
        { id: 'vendors', label: 'Vendor feeds', kind: 'device' },
        { id: 'airflow', label: 'Airflow DAGs', sub: 'AWS MWAA', kind: 'service' },
        { id: 'aws', label: 'AWS data stores', kind: 'store' },
      ],
      edges: [
        { from: 'vendors', to: 'airflow', label: 'ingest' },
        { from: 'airflow', to: 'aws', label: 'load' },
      ],
    },
    cover: 'pipeline',
  },
  {
    slug: 'tool-suite',
    name: 'Tool Suite',
    tagline: 'FastAPI, Vue and React tools unified as micro-frontends.',
    kind: 'enterprise',
    company: 'SenecaGlobal',
    industry: 'Internal tooling',
    role: 'Technical Architect',
    summary:
      'Collection of FastAPI, Vue, and React-based tools consolidated under micro-frontend architecture, improving team collaboration by 30%.',
    services: [],
    tech: ['FastAPI', 'Vue.js', 'React', 'Micro-frontend'],
    metrics: [{ value: 30, prefix: '+', suffix: '%', label: 'team collaboration' }],
    cover: 'grid',
  },
  {
    slug: 'certificate-renewal',
    name: 'Automatic Certificate Renewal',
    tagline: 'Certificates that renew themselves — Django tool plus Go microservice.',
    kind: 'enterprise',
    company: 'HSBC',
    industry: 'Banking',
    role: 'Senior Software Engineer',
    summary:
      'Python Django tool for automatic certificate renewal and server refresh. Reduced manual server interventions by 70%. Golang microservice for periodic certificate assessment and renewal.',
    services: [],
    tech: ['Python', 'Django', 'Golang', 'Microservices', 'Automation'],
    metrics: [{ value: 70, prefix: '−', suffix: '%', label: 'manual server interventions' }],
    cover: 'certificate',
  },
]
```

- [ ] **Step 10: Run tests**

Run: `npx vitest run src/data`
Expected: PASS (8 tests).

- [ ] **Step 11: Commit**

```bash
git add src/data
git commit -m "feat(data): typed content for profile, experience, skills and 9 projects"
```

---

### Task 3: Theme system and safe storage

**Files:**
- Create: `src/lib/storage.ts`, `src/theme/theme.ts`, `src/theme/ThemeProvider.tsx`, `src/theme/ThemeToggle.tsx`
- Modify: `src/AppProviders.tsx`, `index.html` (no-flash script only; full rewrite in Task 15)
- Test: `src/theme/theme.test.tsx`

**Interfaces:**
- Produces:
  - `safeGet(key: string, store?: 'local' | 'session'): string | null`, `safeSet(key, value, store?)`, `safeRemove(key, store?)`
  - `type ThemePref = 'system' | 'light' | 'dark'`, `type Theme = 'light' | 'dark'`
  - `resolveTheme(pref: ThemePref, systemDark: boolean): Theme`, `nextPref(pref: ThemePref): ThemePref`, `readPref(): ThemePref`, `writePref(pref: ThemePref): void`
  - `ThemeProvider`, `useTheme(): { pref: ThemePref; theme: Theme; setPref(p: ThemePref): void; cycle(): void }`, `ThemeToggle`

- [ ] **Step 1: Write the failing test** — `src/theme/theme.test.tsx`

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { nextPref, readPref, resolveTheme, writePref } from './theme'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

afterEach(() => vi.restoreAllMocks())

describe('theme logic', () => {
  test('resolveTheme follows system unless overridden', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  test('nextPref cycles system → light → dark → system', () => {
    expect(nextPref('system')).toBe('light')
    expect(nextPref('light')).toBe('dark')
    expect(nextPref('dark')).toBe('system')
  })

  test('pref persists; system clears the key', () => {
    writePref('dark')
    expect(readPref()).toBe('dark')
    writePref('system')
    expect(localStorage.getItem('theme')).toBeNull()
    expect(readPref()).toBe('system')
  })

  test('garbage or blocked storage falls back to system', () => {
    localStorage.setItem('theme', 'purple')
    expect(readPref()).toBe('system')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readPref()).toBe('system')
    expect(() => writePref('dark')).not.toThrow()
  })
})

describe('ThemeToggle', () => {
  test('cycles and applies data-theme on <html>', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    const button = screen.getByRole('button', { name: /theme: system/i })
    expect(document.documentElement.dataset.theme).toBe('light')
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: /theme: light/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/theme`
Expected: FAIL — cannot resolve `./theme`.

- [ ] **Step 3: Write `src/lib/storage.ts`**

```ts
type Store = 'local' | 'session'

function area(store: Store): Storage {
  return store === 'local' ? window.localStorage : window.sessionStorage
}

export function safeGet(key: string, store: Store = 'local'): string | null {
  try {
    return area(store).getItem(key)
  } catch {
    return null
  }
}

export function safeSet(key: string, value: string, store: Store = 'local'): void {
  try {
    area(store).setItem(key, value)
  } catch {
    // storage unavailable (private mode / blocked) — preference simply isn't remembered
  }
}

export function safeRemove(key: string, store: Store = 'local'): void {
  try {
    area(store).removeItem(key)
  } catch {
    // ignore
  }
}
```

- [ ] **Step 4: Write `src/theme/theme.ts`**

```ts
import { safeGet, safeRemove, safeSet } from '@/lib/storage'

export type ThemePref = 'system' | 'light' | 'dark'
export type Theme = 'light' | 'dark'

const KEY = 'theme'
const ORDER: ThemePref[] = ['system', 'light', 'dark']

export function resolveTheme(pref: ThemePref, systemDark: boolean): Theme {
  if (pref === 'system') return systemDark ? 'dark' : 'light'
  return pref
}

export function nextPref(pref: ThemePref): ThemePref {
  return ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length]
}

export function readPref(): ThemePref {
  const value = safeGet(KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function writePref(pref: ThemePref): void {
  if (pref === 'system') safeRemove(KEY)
  else safeSet(KEY, pref)
}
```

- [ ] **Step 5: Write `src/theme/ThemeProvider.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { nextPref, readPref, resolveTheme, writePref, type Theme, type ThemePref } from './theme'

type ThemeContextValue = {
  pref: ThemePref
  theme: Theme
  setPref: (pref: ThemePref) => void
  cycle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const DARK_QUERY = '(prefers-color-scheme: dark)'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(readPref)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const theme = resolveTheme(pref, systemDark)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p)
    writePref(p)
  }, [])

  const cycle = useCallback(() => setPref(nextPref(pref)), [pref, setPref])

  const value = useMemo(() => ({ pref, theme, setPref, cycle }), [pref, theme, setPref, cycle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
```

- [ ] **Step 6: Write `src/theme/ThemeToggle.tsx`**

```tsx
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const

export function ThemeToggle({ className }: { className?: string }) {
  const { pref, cycle } = useTheme()
  const Icon = ICONS[pref]
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${pref}. Click to change.`}
      title={`Theme: ${pref}`}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/[.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden />
    </button>
  )
}
```

- [ ] **Step 7: Wire provider** — replace `src/AppProviders.tsx`

```tsx
import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { ThemeProvider } from './theme/ThemeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  )
}
```

- [ ] **Step 8: No-flash script** — in `index.html`, insert as the first child of `<head>`:

```html
    <script>
      (function () {
        try {
          var p = localStorage.getItem('theme');
          var dark = p === 'dark' || (p !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        } catch (e) {}
      })();
    </script>
```

- [ ] **Step 9: Run tests**

Run: `npm test`
Expected: PASS (all).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(theme): system-following theme with persisted override and safe storage"
```

---

### Task 4: Motion primitives and UI building blocks

**Files:**
- Create: `src/theme/motion.ts`, `src/components/Reveal.tsx`, `src/components/CountUp.tsx`, `src/components/Section.tsx`, `src/components/Button.ts`, `src/components/Tag.tsx`, `src/components/Toast.tsx`, `src/components/icons.tsx`, `src/components/SocialLinks.tsx`, `src/lib/clipboard.ts`, `src/lib/scroll.ts`, `src/lib/useDocumentMeta.ts`, `src/lib/useMediaQuery.ts`, `src/lib/useActiveSection.ts`
- Modify: `src/AppProviders.tsx` (add ToastProvider)
- Test: `src/components/components.test.tsx`

**Interfaces:**
- Produces:
  - `springs.{reveal,soft,gaze,follow,tilt}`, `EASE`
  - `Reveal({children, className?, delay?})`, `RevealGroup({children, className?, as?: 'div'|'ul'|'ol'})`, `RevealItem({children, className?, as?: 'div'|'li'})`
  - `formatMetric(n: number, decimals?: number): string`, `CountUp({value, prefix?, suffix?, decimals?, className?})`
  - `Section({id, eyebrow, title, intro?, children, className?})`
  - `buttonClass(variant?: 'primary'|'secondary', className?: string): string`
  - `Tag({children})`, `ToastProvider`, `useToast(): (text: string) => void`
  - `GitHubIcon`, `LinkedInIcon` (SVG components, `className` prop)
  - `SocialLinks({className?})`
  - `copyText(text: string): Promise<boolean>`
  - `startSmoothScroll(): () => void`, `scrollToId(id: string): boolean`, `scrollToTop(): void`
  - `useDocumentMeta(title: string, description?: string): void`
  - `useMediaQuery(query: string): boolean`
  - `useActiveSection(ids: readonly string[], key: string): string | null`

- [ ] **Step 1: Write the failing test** — `src/components/components.test.tsx`

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { copyText } from '@/lib/clipboard'
import { CountUp, formatMetric } from './CountUp'
import { Reveal } from './Reveal'
import { ToastProvider, useToast } from './Toast'

afterEach(() => vi.restoreAllMocks())

describe('formatMetric', () => {
  test('formats integers and decimals', () => {
    expect(formatMetric(97)).toBe('97')
    expect(formatMetric(96.6)).toBe('97')
    expect(formatMetric(1234)).toBe('1,234')
    expect(formatMetric(4.25, 1)).toBe('4.3')
  })
})

describe('CountUp', () => {
  test('ends on the final formatted value', async () => {
    render(<CountUp value={97} suffix="%" />)
    expect(await screen.findByText('97%', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})

describe('Reveal', () => {
  test('content ends fully visible once in view', async () => {
    render(<Reveal>visible text</Reveal>)
    const el = screen.getByText('visible text')
    await vi.waitFor(() => expect(el.style.opacity).toBe('1'), { timeout: 3000 })
  })
})

describe('copyText', () => {
  test('returns true when clipboard works and false when it throws or is missing', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    expect(await copyText('a')).toBe(true)
    writeText.mockRejectedValue(new Error('denied'))
    expect(await copyText('a')).toBe(false)
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    expect(await copyText('a')).toBe(false)
  })
})

describe('Toast', () => {
  test('shows a message', async () => {
    function Trigger() {
      const toast = useToast()
      return <button onClick={() => toast('Saved')}>go</button>
    }
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    await act(async () => fireEvent.click(screen.getByText('go')))
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/theme/motion.ts`**

```ts
export const EASE = [0.2, 0.8, 0.2, 1] as const

export const springs = {
  reveal: { type: 'spring', stiffness: 90, damping: 20, mass: 0.9 },
  soft: { type: 'spring', stiffness: 260, damping: 30 },
  gaze: { stiffness: 120, damping: 18 },
  follow: { stiffness: 150, damping: 20, mass: 0.8 },
  tilt: { stiffness: 200, damping: 25 },
} as const
```

- [ ] **Step 4: Write `src/components/Reveal.tsx`**

```tsx
import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { springs } from '@/theme/motion'

const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

function useItemVariants(delay = 0): Variants {
  const reduce = useReducedMotion()
  if (reduce) {
    return { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.15, delay } } }
  }
  return {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { ...springs.reveal, delay } },
  }
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const variants = useItemVariants(delay)
  return (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      {children}
    </motion.div>
  )
}

const groupVariants: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.06 } } }

export function RevealGroup({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'ul' | 'ol'
}) {
  const Component = as === 'ul' ? motion.ul : as === 'ol' ? motion.ol : motion.div
  return (
    <Component className={className} variants={groupVariants} initial="hidden" whileInView="shown" viewport={VIEWPORT}>
      {children}
    </Component>
  )
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' }) {
  const variants = useItemVariants()
  const Component = as === 'li' ? motion.li : motion.div
  return (
    <Component className={className} variants={variants}>
      {children}
    </Component>
  )
}
```

- [ ] **Step 5: Write `src/components/CountUp.tsx`**

```tsx
import { useEffect, useLayoutEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// eslint-disable-next-line react-refresh/only-export-components
export function formatMetric(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

type Props = { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string }

export function CountUp({ value, prefix = '', suffix = '', decimals = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const text = (n: number) => `${prefix}${formatMetric(n, decimals)}${suffix}`

  useLayoutEffect(() => {
    if (!reduce && ref.current) ref.current.textContent = text(0)
    // run once on mount: start from zero before the first paint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduce) {
      el.textContent = text(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = text(v)
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, prefix, suffix, decimals])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {text(value)}
    </span>
  )
}
```

- [ ] **Step 6: Write `src/components/Section.tsx`, `Button.ts`, `Tag.tsx`**

`src/components/Section.tsx`:

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

type Props = { id: string; eyebrow: string; title: string; intro?: string; children: ReactNode; className?: string }

export function Section({ id, eyebrow, title, intro, children, className }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('py-24 sm:py-32', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 max-w-3xl text-title font-semibold">
            {title}
          </h2>
          {intro && <p className="mt-5 max-w-2xl text-lg text-muted">{intro}</p>}
        </Reveal>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  )
}
```

`src/components/Button.ts`:

```ts
import { cn } from '@/lib/utils'

export function buttonClass(variant: 'primary' | 'secondary' = 'primary', className?: string): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-[transform,background-color,color] duration-200 active:scale-[.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    variant === 'primary' ? 'bg-accent text-white hover:bg-accent/90' : 'bg-fg/[.06] text-fg hover:bg-fg/[.1]',
    className,
  )
}
```

`src/components/Tag.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-elevated px-3 py-1 text-[13px] text-fg/80">
      {children}
    </span>
  )
}
```

- [ ] **Step 7: Write `src/components/Toast.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const ToastContext = createContext<(text: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback((text: string) => {
    setToast({ id: Date.now(), text })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="glass rounded-full border border-line px-4 py-2 text-sm shadow-lg"
            >
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}
```

- [ ] **Step 8: Write `src/components/icons.tsx` and `SocialLinks.tsx`**

`src/components/icons.tsx`:

```tsx
type IconProps = { className?: string }

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}
```

`src/components/SocialLinks.tsx`:

```tsx
import { Globe, Mail } from 'lucide-react'
import { profile } from '@/data/profile'
import { cn } from '@/lib/utils'
import { GitHubIcon, LinkedInIcon } from './icons'

const LINKS = [
  { label: 'GitHub', href: profile.github, Icon: GitHubIcon },
  { label: 'LinkedIn', href: profile.linkedin, Icon: LinkedInIcon },
  { label: 'Website', href: profile.website, Icon: Globe },
  { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail },
]

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {LINKS.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            title={label}
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/[.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 9: Write lib helpers**

`src/lib/clipboard.ts`:

```ts
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
```

`src/lib/scroll.ts`:

```ts
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

let lenis: Lenis | null = null

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startSmoothScroll(): () => void {
  if (prefersReduced()) return () => {}
  lenis = new Lenis({ autoRaf: true, lerp: 0.12 })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  if (lenis) lenis.scrollTo(el, { offset: -64 })
  else el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' })
  return true
}

export function scrollToTop(): void {
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' })
}
```

`src/lib/useDocumentMeta.ts`:

```ts
import { useEffect } from 'react'

export function useDocumentMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
```

`src/lib/useMediaQuery.ts`:

```ts
import { useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
```

`src/lib/useActiveSection.ts`:

```ts
import { useEffect, useState } from 'react'

/** Id of the section crossing the middle of the viewport. `key` re-subscribes (e.g. pathname). */
export function useActiveSection(ids: readonly string[], key: string): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // ids is a module constant; re-run only when the page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}
```

- [ ] **Step 10: Add ToastProvider** — replace `src/AppProviders.tsx`

```tsx
import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './theme/ThemeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ToastProvider>
    </ThemeProvider>
  )
}
```

- [ ] **Step 11: Run tests and typecheck**

Run: `npm test && npx tsc -b`
Expected: all PASS, no type errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat(ui): motion presets, reveal/count-up primitives, toast, scroll and meta helpers"
```

---

### Task 5: Routing, layout shell, nav, footer, 404

**Files:**
- Create: `src/routes.tsx`, `src/pages/RootLayout.tsx`, `src/pages/Home.tsx`, `src/pages/ProjectPage.tsx` (stub, replaced in Task 9), `src/pages/NotFound.tsx`, `src/pages/RouteError.tsx`, `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/test/render.tsx`
- Modify: `src/main.tsx`
- Delete: `src/smoke.test.tsx`
- Test: `src/pages/routes.test.tsx`

**Interfaces:**
- Consumes: `AppProviders`, `NAV_SECTIONS`, `SECTION_IDS`, `scrollToId`, `scrollToTop`, `startSmoothScroll`, `useActiveSection`, `useDocumentMeta`, `ThemeToggle`, `SocialLinks`, `buttonClass`, `projects`, `profile`
- Produces: `routes: RouteObject[]`; `renderRoute(path: string)` test helper; `Nav({ active, extra? }: { active: string | null; extra?: ReactNode })`; `NotFound`; `Home` reads `location.state.scrollTo`.

- [ ] **Step 1: Write the failing test** — `src/pages/routes.test.tsx`

```tsx
import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { renderRoute } from '@/test/render'

describe('routes', () => {
  test('home renders the name as the page heading', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { level: 1, name: /Satyam Soni/ })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  test('project route renders the project', async () => {
    renderRoute('/projects/stryve')
    expect(await screen.findByRole('heading', { level: 1, name: 'Stryve' })).toBeInTheDocument()
  })

  test('unknown project slug renders 404 with a link home', async () => {
    renderRoute('/projects/nope')
    expect(await screen.findByText(/wandered off/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/')
  })

  test('unknown path renders 404', async () => {
    renderRoute('/does/not/exist')
    expect(await screen.findByText(/wandered off/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/pages`
Expected: FAIL — `@/test/render` not found.

- [ ] **Step 3: Write `src/test/render.tsx`**

```tsx
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AppProviders } from '@/AppProviders'
import { routes } from '@/routes'

export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return { router, ...render(<AppProviders><RouterProvider router={router} /></AppProviders>) }
}
```

- [ ] **Step 4: Write `src/routes.tsx`**

```tsx
import type { RouteObject } from 'react-router'
import Home from './pages/Home'
import { NotFound } from './pages/NotFound'
import { RootLayout } from './pages/RootLayout'
import { RouteError } from './pages/RouteError'

function PageFallback() {
  return <div className="min-h-screen" />
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    HydrateFallback: PageFallback,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'projects/:slug',
        lazy: async () => ({ Component: (await import('./pages/ProjectPage')).default }),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]
```

- [ ] **Step 5: Write `src/pages/NotFound.tsx` and `RouteError.tsx`**

`src/pages/NotFound.tsx`:

```tsx
import { Link } from 'react-router'
import { buttonClass } from '@/components/Button'
import { useDocumentMeta } from '@/lib/useDocumentMeta'

export function NotFound() {
  useDocumentMeta('Page not found — Satyam Soni')
  return (
    <main id="main" className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 pt-14 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-3 text-title font-semibold">This page wandered off.</h1>
      <p className="mt-4 text-lg text-muted">The link may be broken, or the project may have moved.</p>
      <Link to="/" className={buttonClass('primary', 'mt-8')}>
        Back home
      </Link>
    </main>
  )
}
```

`src/pages/RouteError.tsx`:

```tsx
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { buttonClass } from '@/components/Button'
import { NotFound } from './NotFound'

export function RouteError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-title font-semibold">Something went wrong.</h1>
      <p className="mt-4 text-lg text-muted">A part of the page failed to load — usually a refresh fixes it.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className={buttonClass('primary')}>
          Reload
        </button>
        <Link to="/" className={buttonClass('secondary')}>
          Home
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Write `src/components/Nav.tsx`**

```tsx
import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, useLocation, useNavigate } from 'react-router'
import { NAV_SECTIONS } from '@/data/sections'
import { scrollToId, scrollToTop } from '@/lib/scroll'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/theme/ThemeToggle'

export function Nav({ active, extra }: { active: string | null; extra?: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const go = (id: string) => {
    setOpen(false)
    if (pathname === '/' && scrollToId(id)) return
    navigate('/', { state: { scrollTo: id } })
  }

  return (
    <header className="glass fixed inset-x-0 top-0 z-40 border-b border-line">
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault()
              scrollToTop()
            }
          }}
          className="text-lg font-semibold tracking-tight"
          aria-label="Satyam Soni — home"
        >
          SS<span className="text-accent">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_SECTIONS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-current={active === s.id ? 'true' : undefined}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  active === s.id ? 'bg-fg/[.06] text-fg' : 'text-muted hover:text-fg',
                )}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          {extra}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-fg/[.06] hover:text-fg md:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line px-4 md:hidden"
          >
            {NAV_SECTIONS.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => go(s.id)} className="block w-full py-3 text-left text-lg font-medium">
                  {s.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
```

- [ ] **Step 7: Write `src/components/Footer.tsx`**

```tsx
import { profile } from '@/data/profile'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.name}. Designed &amp; built by Satyam Soni.
        </p>
        <SocialLinks />
      </div>
    </footer>
  )
}
```

- [ ] **Step 8: Write `src/pages/RootLayout.tsx`**

```tsx
import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { SECTION_IDS } from '@/data/sections'
import { startSmoothScroll } from '@/lib/scroll'
import { useActiveSection } from '@/lib/useActiveSection'

export function RootLayout() {
  const { pathname } = useLocation()
  const active = useActiveSection(SECTION_IDS, pathname)

  useEffect(() => startSmoothScroll(), [])

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <Nav active={pathname === '/' ? active : null} />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </>
  )
}
```

- [ ] **Step 9: Write `src/pages/Home.tsx`** (sections are added by later tasks)

```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { profile } from '@/data/profile'
import { scrollToId } from '@/lib/scroll'
import { useDocumentMeta } from '@/lib/useDocumentMeta'

export default function Home() {
  const location = useLocation()
  useDocumentMeta(`${profile.name} — ${profile.role}`, profile.metaDescription)

  useEffect(() => {
    const id = (location.state as { scrollTo?: string } | null)?.scrollTo
    if (id) requestAnimationFrame(() => scrollToId(id))
  }, [location.state])

  return (
    <main id="main">
      <section id="hero" className="mx-auto max-w-6xl px-4 pt-32 sm:px-6">
        <h1 className="text-display font-semibold">{profile.name}.</h1>
      </section>
    </main>
  )
}
```

- [ ] **Step 10: Write stub `src/pages/ProjectPage.tsx`** (full page in Task 9)

```tsx
import { useParams } from 'react-router'
import { projects } from '@/data/projects'
import { NotFound } from './NotFound'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  if (!project) return <NotFound />
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
      <h1 className="text-title font-semibold">{project.name}</h1>
    </main>
  )
}
```

- [ ] **Step 11: Replace `src/main.tsx` and delete the smoke test**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { AppProviders } from './AppProviders'
import { routes } from './routes'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
```

Run: `git rm -q src/smoke.test.tsx`

- [ ] **Step 12: Run tests, typecheck and lint**

Run: `npm test && npx tsc -b && npm run lint`
Expected: all PASS; no type or lint errors (fix any lint findings in the files of this task).

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(app): router with lazy project route, layout shell, nav, footer and 404"
```

---

### Task 6: Hero and About sections

**Files:**
- Create: `src/sections/Hero.tsx`, `src/sections/About.tsx`
- Modify: `src/pages/Home.tsx`
- Test: `src/sections/sections.test.tsx`

**Interfaces:**
- Consumes: `profile`, `experience`, `projects`, `Reveal*`, `CountUp`, `Section`, `Tag`, `buttonClass`, `scrollToId`
- Produces: `Hero` (contains `<div data-hero-character-slot>`, replaced by `<HeroCharacter />` in Task 13), `About`

- [ ] **Step 1: Write the failing test** — `src/sections/sections.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { About } from './About'
import { Hero } from './Hero'

const wrap = (ui: React.ReactNode) => render(<AppProviders>{ui}</AppProviders>)

describe('Hero', () => {
  test('shows name, pitch, CTAs and stats', async () => {
    wrap(<Hero />)
    expect(screen.getByRole('heading', { level: 1, name: /Satyam Soni/ })).toBeInTheDocument()
    expect(screen.getByText(/design data platforms, AI systems/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View work' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get in touch' })).toBeInTheDocument()
    expect(screen.getByText('years building software')).toBeInTheDocument()
    expect(await screen.findByText('9', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})

describe('About', () => {
  test('shows bio with 10+ years, pillars and industries', () => {
    wrap(<About />)
    expect(screen.getByText(/10\+ years of experience/)).toBeInTheDocument()
    for (const t of ['Data & Platforms', 'AI & LLMs', 'Leadership']) expect(screen.getByText(t)).toBeInTheDocument()
    expect(screen.getByText('Manufacturing')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/sections`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/sections/Hero.tsx`**

```tsx
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { buttonClass } from '@/components/Button'
import { CountUp } from '@/components/CountUp'
import { RevealGroup, RevealItem } from '@/components/Reveal'
import { experience } from '@/data/experience'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import { scrollToId } from '@/lib/scroll'

const STATS = [
  { value: 10, suffix: '+', label: 'years building software' },
  { value: experience.length, label: 'companies' },
  { value: projects.length, label: 'featured projects' },
  { value: 10, suffix: '+', label: 'engineers led' },
]

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120])
  const yPitch = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0])

  return (
    <section id="hero" ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-28 sm:pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.25fr_.75fr]">
        <motion.div style={{ y: yTitle, opacity: fade }}>
          <RevealGroup>
            <RevealItem>
              <p className="text-sm font-medium text-muted">
                {profile.role} · {profile.location}
              </p>
            </RevealItem>
            <RevealItem>
              <h1 id="hero-title" className="mt-4 text-display font-semibold">
                {profile.name}
                <span className="text-accent">.</span>
              </h1>
            </RevealItem>
            <RevealItem>
              <motion.p style={{ y: yPitch }} className="mt-6 max-w-xl text-2xl leading-snug text-muted sm:text-3xl">
                {profile.pitch}
              </motion.p>
            </RevealItem>
            <RevealItem className="mt-10 flex flex-wrap gap-3">
              <button type="button" onClick={() => scrollToId('projects')} className={buttonClass('primary')}>
                View work
              </button>
              <button type="button" onClick={() => scrollToId('contact')} className={buttonClass('secondary')}>
                Get in touch
              </button>
            </RevealItem>
          </RevealGroup>

          <dl className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-muted">{s.label}</dt>
                <dd className="text-4xl font-semibold tracking-tight">
                  <CountUp value={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <div data-hero-character-slot aria-hidden className="h-[360px] lg:h-[min(72vh,640px)]" style={{ aspectRatio: '750 / 2020' }} />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Write `src/sections/About.tsx`**

```tsx
import { Reveal, RevealGroup, RevealItem } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { Tag } from '@/components/Tag'
import { profile } from '@/data/profile'

export function About() {
  return (
    <Section id="about" eyebrow="About" title="A decade of turning messy data into dependable systems.">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <RevealGroup className="space-y-5 text-lg leading-relaxed text-muted">
          {profile.bio.map((paragraph) => (
            <RevealItem key={paragraph.slice(0, 24)}>
              <p>{paragraph}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <RevealGroup as="ul" className="grid gap-4">
          {profile.pillars.map((pillar) => (
            <RevealItem as="li" key={pillar.title} className="card p-6">
              <h3 className="text-lg font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-muted">{pillar.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
      <Reveal className="mt-14">
        <h3 className="text-sm font-medium text-muted">Industries</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {profile.industries.map((industry) => (
            <li key={industry}>
              <Tag>{industry}</Tag>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
```

- [ ] **Step 5: Mount in Home** — in `src/pages/Home.tsx` replace the `<main>` body and add imports:

```tsx
import { About } from '@/sections/About'
import { Hero } from '@/sections/Hero'
```

```tsx
    <main id="main">
      <Hero />
      <About />
    </main>
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(sections): hero with parallax and count-up stats, about with pillars"
```

---

### Task 7: Experience timeline

**Files:**
- Create: `src/sections/Experience.tsx`
- Modify: `src/pages/Home.tsx`, `src/sections/sections.test.tsx`

**Interfaces:**
- Consumes: `experience`, `Section`, `Reveal`, `Tag`, `EASE`
- Produces: `Experience`, `firstSentence(text: string): string`

- [ ] **Step 1: Add failing tests** — append to `src/sections/sections.test.tsx`

```tsx
import { fireEvent } from '@testing-library/react'
import { Experience, firstSentence } from './Experience'

describe('Experience', () => {
  test('firstSentence cuts at the first full stop', () => {
    expect(firstSentence('One thing. Two things.')).toBe('One thing.')
    expect(firstSentence('No stop')).toBe('No stop')
  })

  test('lists 5 roles; first is open; clicking another expands it', () => {
    wrap(<Experience />)
    const toggles = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded'))
    expect(toggles).toHaveLength(5)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
    expect(toggles[1]).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggles[1])
    expect(toggles[1]).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Designed fault-tolerant cloud-native architectures on AWS/)).toBeInTheDocument()
  })
})
```

(Move the two new imports to the top of the file with the others.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/sections`
Expected: FAIL — `./Experience` not found.

- [ ] **Step 3: Write `src/sections/Experience.tsx`**

```tsx
import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { Tag } from '@/components/Tag'
import { experience } from '@/data/experience'
import { cn } from '@/lib/utils'
import { EASE } from '@/theme/motion'

// eslint-disable-next-line react-refresh/only-export-components
export function firstSentence(text: string): string {
  const match = text.match(/^.*?\.(?=\s|$)/)
  return match ? match[0] : text
}

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] })
  const fill = useTransform(scrollYProgress, (v) => (reduce ? 1 : v))
  const [open, setOpen] = useState<number | null>(0)

  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Ten years, five companies, one through-line."
      intro="From ETL automation in banking to architecting AI platforms in real estate."
    >
      <div ref={listRef} className="relative ml-1.5 sm:ml-2">
        <div aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line" />
        <motion.div aria-hidden style={{ scaleY: fill }} className="absolute bottom-2 left-0 top-2 w-px origin-top bg-accent" />
        <ol>
          {experience.map((job, i) => {
            const isOpen = open === i
            return (
              <li key={job.company} className="relative pb-12 pl-8 last:pb-0 sm:pl-12">
                <span
                  aria-hidden
                  className={cn(
                    'absolute -left-[5px] top-2 h-[11px] w-[11px] rounded-full border-2 border-bg transition-colors',
                    isOpen ? 'bg-accent' : 'bg-muted/60',
                  )}
                />
                <Reveal>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`job-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <p className="text-sm text-muted">
                      {job.period} · {job.location}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{job.role}</h3>
                    <p className="mt-1 flex items-center gap-1 font-medium text-accent">
                      {job.company}
                      <ChevronDown aria-hidden className={cn('h-4 w-4 transition-transform duration-300', isOpen && 'rotate-180')} />
                    </p>
                    {!isOpen && <p className="mt-3 line-clamp-2 text-muted">{firstSentence(job.description)}</p>}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`job-${i}`}
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 max-w-3xl leading-relaxed text-muted">{job.description}</p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {job.technologies.map((t) => (
                            <li key={t}>
                              <Tag>{t}</Tag>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: Mount in Home** — add `import { Experience } from '@/sections/Experience'` and `<Experience />` after `<About />`.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(sections): scroll-filled experience timeline with expandable roles"
```

---

### Task 8: Project covers and Projects grid

**Files:**
- Create: `src/components/ProjectCover.tsx`, `src/components/ProjectCard.tsx`, `src/sections/Projects.tsx`
- Modify: `src/pages/Home.tsx`, `src/sections/sections.test.tsx`

**Interfaces:**
- Consumes: `projects`, `Project`, `CoverVariant`, `Metric`, `Section`, `Tag`, `springs`
- Produces: `ProjectCover({ variant, slug, className? })` (sets `viewTransitionName: cover-<slug>`), `ProjectCard({ project })`, `filterProjects(list: Project[], filter: ProjectFilter): Project[]`, `type ProjectFilter = 'all' | 'freelance' | 'enterprise'`, `metricText(m: Metric): string`, `Projects`

- [ ] **Step 1: Add failing tests** — append to `src/sections/sections.test.tsx` (imports at top)

```tsx
import { MemoryRouter } from 'react-router'
import { waitFor } from '@testing-library/react'
import { projects } from '@/data/projects'
import { metricText } from '@/components/ProjectCard'
import { filterProjects, Projects } from './Projects'

describe('Projects', () => {
  test('filterProjects', () => {
    expect(filterProjects(projects, 'all')).toHaveLength(9)
    expect(filterProjects(projects, 'freelance').map((p) => p.slug)).toEqual(['defect-detection', 'stryve', 'crickbuzz'])
    expect(filterProjects(projects, 'enterprise')).toHaveLength(6)
  })

  test('metricText', () => {
    expect(metricText({ value: 5, prefix: '≤ ', suffix: ' s', label: 'x' })).toBe('≤ 5 s')
    expect(metricText({ text: 'In-house', label: 'x' })).toBe('In-house')
  })

  test('cards link to case studies and filtering hides enterprise', async () => {
    wrap(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Stryve/ })).toHaveAttribute('href', '/projects/stryve')
    expect(screen.getAllByRole('link', { name: /case study/i })).toHaveLength(9)
    const freelance = screen.getByRole('button', { name: 'Freelance' })
    fireEvent.click(freelance)
    expect(freelance).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(screen.queryByRole('link', { name: /FUSION/ })).not.toBeInTheDocument(), { timeout: 3000 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/sections`
Expected: FAIL — `./Projects` not found.

- [ ] **Step 3: Write `src/components/ProjectCover.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react'
import type { CoverVariant } from '@/data/types'
import { cn } from '@/lib/utils'

const HUES: Record<CoverVariant, number> = {
  gear: 25, pose: 150, pitch: 95, graph: 265, brackets: 200, layers: 320, pipeline: 185, grid: 230, certificate: 45,
}

function Figure({ x, arm, accent }: { x: number; arm: number; accent?: boolean }) {
  const joint = accent ? 'fill-accent' : 'fill-current'
  return (
    <g className={accent ? 'stroke-accent' : undefined}>
      <circle cx={x} cy={62} r={13} />
      <path d={`M${x} 75 L${x} 140 M${x} 92 L${x - 38} ${92 + arm} M${x} 92 L${x + 38} ${92 - arm} M${x} 140 L${x - 26} 196 M${x} 140 L${x + 26} 196`} />
      {[[x, 92], [x - 38, 92 + arm], [x + 38, 92 - arm], [x, 140], [x - 26, 196], [x + 26, 196]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.5} className={joint} stroke="none" />
      ))}
    </g>
  )
}

const ART: Record<CoverVariant, ReactNode> = {
  gear: (
    <g>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={193} y={50} width={14} height={18} rx={3} transform={`rotate(${i * 30} 200 125)`} />
      ))}
      <circle cx={200} cy={125} r={58} />
      <circle cx={200} cy={125} r={20} />
      <rect x={222} y={66} width={74} height={56} rx={4} strokeDasharray="6 5" className="stroke-accent" />
      <rect x={222} y={48} width={74} height={18} rx={4} className="fill-accent stroke-accent" />
      <text x={259} y={61} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-white" stroke="none">
        defect 0.97
      </text>
    </g>
  ),
  pose: (
    <g>
      <Figure x={150} arm={-18} />
      <Figure x={250} arm={-10} accent />
      <path d="M180 220 L220 220" strokeDasharray="3 6" />
    </g>
  ),
  pitch: (
    <g>
      <polygon points="150,232 250,232 224,42 176,42" />
      <path d="M160 205 L240 205 M178 60 L222 60" />
      <path d="M190 42 L190 22 M200 42 L200 22 M210 42 L210 22" />
      <path d="M340 26 Q235 36 206 150 Q201 176 196 218" strokeDasharray="1 9" strokeWidth={4} className="stroke-accent" />
      <circle cx={206} cy={150} r={7} className="fill-accent stroke-accent" />
    </g>
  ),
  graph: (
    <g>
      {[[200, 125, 110, 70], [200, 125, 300, 70], [200, 125, 110, 185], [200, 125, 300, 185], [110, 70, 300, 70], [300, 185, 110, 185]].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
      {[[110, 70], [300, 70], [110, 185], [300, 185]].map(([cx, cy]) => (
        <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={14} className="fill-bg" />
      ))}
      <circle cx={200} cy={125} r={24} className="fill-accent stroke-accent" />
    </g>
  ),
  brackets: (
    <g>
      <path d="M150 70 L95 125 L150 180 M250 70 L305 125 L250 180" strokeWidth={6} />
      <path d="M222 60 L178 190" strokeWidth={6} className="stroke-accent" />
    </g>
  ),
  layers: (
    <g>
      {[150, 120, 90].map((y, i) => (
        <path key={y} d={`M200 ${y - 30} L290 ${y} L200 ${y + 30} L110 ${y} Z`} className={i === 2 ? 'stroke-accent' : undefined} />
      ))}
    </g>
  ),
  pipeline: (
    <g>
      {[70, 175, 280].map((x, i) => (
        <rect key={x} x={x - 32} y={100} width={64} height={50} rx={12} className={i === 1 ? 'stroke-accent' : undefined} />
      ))}
      <path d="M102 125 L143 125 M207 125 L248 125" />
      {[118, 130, 224, 236].map((x) => (
        <circle key={x} cx={x} cy={125} r={3} className="fill-accent stroke-accent" />
      ))}
    </g>
  ),
  grid: (
    <g>
      {[0, 1, 2].flatMap((c) =>
        [0, 1].map((r) => (
          <rect
            key={`${c}${r}`}
            x={110 + c * 64}
            y={70 + r * 64}
            width={52}
            height={52}
            rx={12}
            className={c === 1 && r === 0 ? 'fill-accent/20 stroke-accent' : undefined}
          />
        )),
      )}
    </g>
  ),
  certificate: (
    <g>
      <rect x={120} y={55} width={160} height={120} rx={10} />
      <path d="M145 90 L255 90 M145 112 L230 112" />
      <circle cx={245} cy={160} r={24} className="fill-bg stroke-accent" />
      <path d="M235 160 L243 168 L257 152" className="stroke-accent" strokeWidth={3} />
      <path d="M95 200 A 110 110 0 0 0 305 200" strokeDasharray="4 8" />
    </g>
  ),
}

export function ProjectCover({ variant, slug, className }: { variant: CoverVariant; slug: string; className?: string }) {
  const hue = HUES[variant]
  const style = {
    viewTransitionName: `cover-${slug}`,
    backgroundImage: `radial-gradient(120% 120% at 0% 0%, hsl(${hue} 90% 60% / .26), transparent 60%), radial-gradient(120% 120% at 100% 100%, hsl(${hue + 50} 90% 60% / .2), transparent 55%)`,
  } as CSSProperties
  return (
    <div className={cn('relative overflow-hidden bg-fg/[.02]', className)} style={style}>
      <svg
        viewBox="0 0 400 250"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 h-full w-full text-fg/70 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      >
        {ART[variant]}
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/ProjectCard.tsx`**

```tsx
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import type { Metric, Project } from '@/data/types'
import { cn } from '@/lib/utils'
import { ProjectCover } from './ProjectCover'
import { Tag } from './Tag'

// eslint-disable-next-line react-refresh/only-export-components
export function metricText(m: Metric): string {
  return 'text' in m ? m.text : `${m.prefix ?? ''}${m.value}${m.suffix ?? ''}`
}

export function ProjectCard({ project }: { project: Project }) {
  const freelance = project.kind === 'freelance'
  const headline = project.metrics[0]
  return (
    <Link
      to={`/projects/${project.slug}`}
      viewTransition
      className="card group flex h-full flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ProjectCover variant={project.cover} slug={project.slug} className={freelance ? 'aspect-[4/3]' : 'aspect-[16/10]'} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={cn('rounded-full px-2.5 py-1', freelance ? 'bg-accent/10 text-accent' : 'bg-fg/[.06] text-muted')}>
            {freelance ? 'Freelance' : project.company}
          </span>
          <span className="text-muted">{project.industry}</span>
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight">{project.name}</h3>
        <p className="mt-2 text-muted">{project.tagline}</p>
        {headline && (
          <p className="mt-4 text-sm">
            <span className="font-semibold">{metricText(headline)}</span> <span className="text-muted">{headline.label}</span>
          </p>
        )}
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((t) => (
            <li key={t}>
              <Tag>{t}</Tag>
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-accent">
          Read case study <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 5: Write `src/sections/Projects.tsx`**

```tsx
import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ProjectCard } from '@/components/ProjectCard'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { projects } from '@/data/projects'
import type { Project } from '@/data/types'
import { cn } from '@/lib/utils'
import { springs } from '@/theme/motion'

export type ProjectFilter = 'all' | 'freelance' | 'enterprise'

// eslint-disable-next-line react-refresh/only-export-components
export function filterProjects(list: Project[], filter: ProjectFilter): Project[] {
  return filter === 'all' ? list : list.filter((p) => p.kind === filter)
}

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'enterprise', label: 'Enterprise' },
]

export function Projects() {
  const [filter, setFilter] = useState<ProjectFilter>('all')
  const visible = filterProjects(projects, filter)

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Things I've designed and shipped."
      intro="Three recent freelance builds in computer vision, plus enterprise platforms delivered at SenecaGlobal and HSBC."
    >
      <Reveal>
        <div role="group" aria-label="Filter projects" className="inline-flex rounded-full bg-fg/[.05] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                filter === f.id ? 'text-fg' : 'text-muted hover:text-fg',
              )}
            >
              {filter === f.id && (
                <motion.span layoutId="project-filter-pill" transition={springs.soft} className="absolute inset-0 rounded-full bg-elevated shadow-sm" />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <LayoutGroup>
        <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p) => (
              <motion.li
                layout
                key={p.slug}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={springs.soft}
              >
                <ProjectCard project={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </Section>
  )
}
```

- [ ] **Step 6: Mount in Home** — add `import { Projects } from '@/sections/Projects'` and `<Projects />` after `<Experience />`.

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(projects): generated covers, filterable project grid with layout animation"
```

---

### Task 9: Architecture diagram and case-study page

**Files:**
- Create: `src/lib/graph.ts`, `src/components/ArchitectureDiagram.tsx`
- Modify: `src/pages/ProjectPage.tsx` (full implementation)
- Test: `src/lib/graph.test.ts`, `src/pages/routes.test.tsx`

**Interfaces:**
- Consumes: `Architecture`, `ArchNode`, `projects`, `ProjectCover`, `CountUp`, `Reveal*`, `Tag`, `NotFound`, `useDocumentMeta`, `metricText`
- Produces:
  - `layoutGraph(arch: Architecture, opts?: Partial<GraphOptions>): GraphLayout`
  - `type GraphOptions = { nodeW: number; nodeH: number; gapX: number; gapY: number; pad: number }`
  - `type PlacedNode = ArchNode & { x: number; y: number; layer: number }`
  - `type PlacedEdge = { from: string; to: string; label?: string; bidirectional?: boolean; path: string; labelX: number; labelY: number }`
  - `type GraphLayout = { width: number; height: number; nodeW: number; nodeH: number; nodes: PlacedNode[]; edges: PlacedEdge[] }`
  - `ArchitectureDiagram({ graph }: { graph: Architecture })`

- [ ] **Step 1: Write the failing test** — `src/lib/graph.test.ts`

```ts
import { describe, expect, test } from 'vitest'
import { projects } from '@/data/projects'
import { layoutGraph } from './graph'

const defect = projects.find((p) => p.slug === 'defect-detection')!.architecture!

describe('layoutGraph', () => {
  test('assigns longest-path layers', () => {
    const { nodes } = layoutGraph(defect)
    const layer = Object.fromEntries(nodes.map((n) => [n.id, n.layer]))
    expect(layer).toEqual({ dash: 0, backend: 1, camsvc: 2, yolo: 2, db: 2, cams: 3 })
  })

  test('sizes the canvas to the widest layer', () => {
    const g = layoutGraph(defect, { nodeW: 100, nodeH: 40, gapX: 10, gapY: 50, pad: 5 })
    expect(g.width).toBe(3 * 100 + 2 * 10 + 2 * 5)
    expect(g.height).toBe(4 * 40 + 3 * 50 + 2 * 5)
  })

  test('nodes in a layer share y and do not overlap', () => {
    const { nodes, nodeW } = layoutGraph(defect)
    const row = nodes.filter((n) => n.layer === 2).sort((a, b) => a.x - b.x)
    expect(new Set(row.map((n) => n.y)).size).toBe(1)
    for (let i = 1; i < row.length; i++) expect(row[i].x - row[i - 1].x).toBeGreaterThanOrEqual(nodeW)
  })

  test('edges go from source bottom to target top', () => {
    const g = layoutGraph(defect)
    const e = g.edges.find((x) => x.from === 'dash')!
    const src = g.nodes.find((n) => n.id === 'dash')!
    expect(e.path.startsWith(`M${src.x + g.nodeW / 2} ${src.y + g.nodeH}`)).toBe(true)
  })

  test('throws on unknown node ids and cycles', () => {
    expect(() => layoutGraph({ nodes: [{ id: 'a', label: 'A', kind: 'service' }], edges: [{ from: 'a', to: 'zzz' }] })).toThrow(/unknown/i)
    expect(() =>
      layoutGraph({
        nodes: [{ id: 'a', label: 'A', kind: 'service' }, { id: 'b', label: 'B', kind: 'service' }],
        edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }],
      }),
    ).toThrow(/cycle/i)
  })

  test('every project architecture lays out', () => {
    for (const p of projects) if (p.architecture) expect(() => layoutGraph(p.architecture!)).not.toThrow()
  })
})
```

Append to `src/pages/routes.test.tsx`:

```tsx
  test('case study shows overview, services, architecture, results and next link', async () => {
    renderRoute('/projects/defect-detection')
    expect(await screen.findByRole('heading', { level: 1, name: 'Defect Detection' })).toBeInTheDocument()
    for (const h of ['Overview', 'Architecture', 'Services', 'Models', 'Tech stack', 'Results']) {
      expect(screen.getByRole('heading', { level: 2, name: h })).toBeInTheDocument()
    }
    expect(screen.getByRole('img', { name: /Architecture: Defect Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Next.*Stryve/ })).toHaveAttribute('href', '/projects/stryve')
    expect(screen.getByRole('link', { name: /Previous.*Automatic Certificate Renewal/ })).toBeInTheDocument()
  })

  test('enterprise case study without services omits that section', async () => {
    renderRoute('/projects/tool-suite')
    expect(await screen.findByRole('heading', { level: 1, name: 'Tool Suite' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Services' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Architecture' })).not.toBeInTheDocument()
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/graph.test.ts src/pages`
Expected: FAIL — `./graph` not found; case-study headings missing.

- [ ] **Step 3: Write `src/lib/graph.ts`**

```ts
import type { ArchNode, Architecture } from '@/data/types'

export type GraphOptions = { nodeW: number; nodeH: number; gapX: number; gapY: number; pad: number }
export type PlacedNode = ArchNode & { x: number; y: number; layer: number }
export type PlacedEdge = {
  from: string
  to: string
  label?: string
  bidirectional?: boolean
  path: string
  labelX: number
  labelY: number
}
export type GraphLayout = { width: number; height: number; nodeW: number; nodeH: number; nodes: PlacedNode[]; edges: PlacedEdge[] }

const DEFAULTS: GraphOptions = { nodeW: 168, nodeH: 58, gapX: 24, gapY: 72, pad: 8 }

export function layoutGraph(arch: Architecture, opts: Partial<GraphOptions> = {}): GraphLayout {
  const { nodeW, nodeH, gapX, gapY, pad } = { ...DEFAULTS, ...opts }
  const ids = new Set(arch.nodes.map((n) => n.id))
  for (const e of arch.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) throw new Error(`Unknown node in edge ${e.from} → ${e.to}`)
  }

  // Longest-path layering via relaxation; more than N passes means a cycle.
  const layer = new Map(arch.nodes.map((n) => [n.id, 0]))
  for (let pass = 0; ; pass++) {
    if (pass > arch.nodes.length) throw new Error('Architecture graph has a cycle')
    let changed = false
    for (const e of arch.edges) {
      const next = layer.get(e.from)! + 1
      if (next > layer.get(e.to)!) {
        layer.set(e.to, next)
        changed = true
      }
    }
    if (!changed) break
  }

  const layers: ArchNode[][] = []
  for (const n of arch.nodes) (layers[layer.get(n.id)!] ??= []).push(n)
  const widest = Math.max(...layers.map((l) => l.length))
  const width = widest * nodeW + (widest - 1) * gapX + 2 * pad
  const height = layers.length * nodeH + (layers.length - 1) * gapY + 2 * pad

  const nodes: PlacedNode[] = layers.flatMap((row, li) => {
    const rowW = row.length * nodeW + (row.length - 1) * gapX
    const x0 = (width - rowW) / 2
    return row.map((n, i) => ({ ...n, layer: li, x: x0 + i * (nodeW + gapX), y: pad + li * (nodeH + gapY) }))
  })
  const byId = new Map(nodes.map((n) => [n.id, n]))

  const outgoing = new Map<string, number>()
  const edges: PlacedEdge[] = arch.edges.map((e) => {
    const s = byId.get(e.from)!
    const t = byId.get(e.to)!
    const siblings = arch.edges.filter((x) => x.from === e.from).length
    const k = outgoing.get(e.from) ?? 0
    outgoing.set(e.from, k + 1)
    const x1 = s.x + nodeW / 2 + (k - (siblings - 1) / 2) * 14
    const y1 = s.y + nodeH
    const x2 = t.x + nodeW / 2
    const y2 = t.y
    const dy = (y2 - y1) / 2
    const path = `M${x1} ${y1} C${x1} ${y1 + dy} ${x2} ${y2 - dy} ${x2} ${y2}`
    return { ...e, path, labelX: (x1 + x2) / 2 + 6, labelY: (y1 + y2) / 2 + 4 }
  })

  return { width, height, nodeW, nodeH, nodes, edges }
}
```

Note: the first `edges` test asserts the path starts at `M${src.x + nodeW/2} ...`; `dash` has a single outgoing edge so its offset is 0.

- [ ] **Step 4: Write `src/components/ArchitectureDiagram.tsx`**

```tsx
import { useId, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { ArchNode, Architecture } from '@/data/types'
import { layoutGraph } from '@/lib/graph'

const KIND_CLASS: Record<ArchNode['kind'], string> = {
  client: 'fill-elevated stroke-line',
  service: 'fill-accent/10 stroke-accent',
  model: 'fill-[hsl(280_80%_60%/.12)] stroke-[hsl(280_70%_60%)]',
  store: 'fill-fg/[.04] stroke-line',
  device: 'fill-fg/[.04] stroke-line [stroke-dasharray:5_4]',
}

export function ArchitectureDiagram({ graph }: { graph: Architecture }) {
  const layout = useMemo(() => layoutGraph(graph), [graph])
  const reduce = useReducedMotion()
  const marker = `arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { nodeW, nodeH } = layout

  return (
    <div className="card overflow-x-auto p-4 sm:p-8">
      <svg
        role="img"
        aria-label={`Architecture: ${graph.nodes.map((n) => n.label).join(', ')}`}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="mx-auto block w-full min-w-[480px] max-w-3xl"
      >
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-muted" />
          </marker>
        </defs>
        {layout.edges.map((e, i) => (
          <g key={`${e.from}-${e.to}`}>
            <motion.path
              d={e.path}
              fill="none"
              strokeWidth={1.5}
              className="stroke-muted/70"
              markerEnd={`url(#${marker})`}
              markerStart={e.bidirectional ? `url(#${marker})` : undefined}
              initial={{ pathLength: reduce ? 1 : 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.15 : 0.8, delay: reduce ? 0 : 0.25 + i * 0.08 }}
            />
            {e.label && (
              <text x={e.labelX} y={e.labelY} fontSize={11} className="fill-muted">
                {e.label}
              </text>
            )}
          </g>
        ))}
        {layout.nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: reduce ? 0 : i * 0.06 }}
          >
            <rect x={n.x} y={n.y} width={nodeW} height={nodeH} rx={14} strokeWidth={1.25} className={KIND_CLASS[n.kind]} />
            <text x={n.x + nodeW / 2} y={n.y + (n.sub ? 25 : 34)} textAnchor="middle" fontSize={13} fontWeight={600} className="fill-fg">
              {n.label}
            </text>
            {n.sub && (
              <text x={n.x + nodeW / 2} y={n.y + 43} textAnchor="middle" fontSize={11} className="fill-muted">
                {n.sub}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
```

- [ ] **Step 5: Replace `src/pages/ProjectPage.tsx`**

```tsx
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram'
import { CountUp } from '@/components/CountUp'
import { ProjectCover } from '@/components/ProjectCover'
import { Reveal, RevealGroup, RevealItem } from '@/components/Reveal'
import { Tag } from '@/components/Tag'
import { profile } from '@/data/profile'
import { projects } from '@/data/projects'
import type { Project } from '@/data/types'
import { useDocumentMeta } from '@/lib/useDocumentMeta'
import { NotFound } from './NotFound'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-20">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Neighbor({ project, dir }: { project: Project; dir: 'Previous' | 'Next' }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      viewTransition
      className="card group flex flex-1 flex-col gap-1 p-6 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="flex items-center gap-1 text-sm text-muted">
        {dir === 'Previous' && <ArrowLeft aria-hidden className="h-4 w-4" />}
        {dir}
        {dir === 'Next' && <ArrowRight aria-hidden className="h-4 w-4" />}
      </span>
      <span className="text-lg font-semibold">{project.name}</span>
    </Link>
  )
}

export default function ProjectPage() {
  const { slug } = useParams()
  const index = projects.findIndex((p) => p.slug === slug)
  const project = projects[index]
  useDocumentMeta(project ? `${project.name} — ${profile.name}` : 'Page not found — Satyam Soni', project?.tagline)
  if (!project) return <NotFound />

  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  const facts = [
    { label: 'Role', value: project.role },
    { label: project.kind === 'freelance' ? 'Engagement' : 'Company', value: project.kind === 'freelance' ? 'Freelance' : project.company! },
    { label: 'Industry', value: project.industry },
  ]

  return (
    <main id="main" className="pb-24 pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Link to="/" state={{ scrollTo: 'projects' }} className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowLeft aria-hidden className="h-4 w-4" /> All projects
        </Link>

        <ProjectCover variant={project.cover} slug={project.slug} className="mt-6 aspect-[16/9] rounded-[28px] border border-line sm:aspect-[21/9]" />

        <Reveal className="mt-10">
          <p className="text-sm font-semibold text-accent">{project.kind === 'freelance' ? 'Freelance' : project.company}</p>
          <h1 className="mt-2 text-title font-semibold">{project.name}</h1>
          <p className="mt-4 max-w-3xl text-xl text-muted sm:text-2xl">{project.tagline}</p>
        </Reveal>

        <Reveal className="mt-10">
          <dl className="card grid gap-6 p-6 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-sm text-muted">{f.label}</dt>
                <dd className="mt-1 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Block title="Overview">
          <Reveal className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted">
            <p>{project.summary}</p>
            {project.problem && (
              <p>
                <span className="font-semibold text-fg">The problem. </span>
                {project.problem}
              </p>
            )}
            {project.solution && (
              <p>
                <span className="font-semibold text-fg">The solution. </span>
                {project.solution}
              </p>
            )}
          </Reveal>
        </Block>

        {project.architecture && (
          <Block title="Architecture">
            <ArchitectureDiagram graph={project.architecture} />
          </Block>
        )}

        {project.services.length > 0 && (
          <Block title="Services">
            <RevealGroup as="ul" className="grid gap-4 md:grid-cols-2">
              {project.services.map((s) => (
                <RevealItem as="li" key={s.name} className="card p-6">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-2 text-muted">{s.description}</p>
                  {s.points && (
                    <ul className="mt-4 space-y-2 text-[15px]">
                      {s.points.map((pt) => (
                        <li key={pt} className="flex gap-2">
                          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </RevealItem>
              ))}
            </RevealGroup>
          </Block>
        )}

        {project.models && (
          <Block title="Models">
            <ul className="flex flex-wrap gap-2">
              {project.models.map((m) => (
                <li key={m}>
                  <Tag>{m}</Tag>
                </li>
              ))}
            </ul>
          </Block>
        )}

        <Block title="Tech stack">
          <ul className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Results">
          <dl className="grid gap-4 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div key={m.label} className="card flex flex-col-reverse p-6">
                <dt className="mt-2 text-muted">{m.label}</dt>
                <dd className="text-5xl font-semibold tracking-tight">
                  {'text' in m ? m.text : <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />}
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        <nav aria-label="More projects" className="mt-24 flex flex-col gap-4 sm:flex-row">
          <Neighbor project={prev} dir="Previous" />
          <Neighbor project={next} dir="Next" />
        </nav>
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(projects): case-study page with animated architecture diagram"
```

---

### Task 10: Skills, Education and Contact

**Files:**
- Create: `src/sections/Skills.tsx`, `src/sections/Education.tsx`, `src/sections/Contact.tsx`
- Modify: `src/pages/Home.tsx`, `src/sections/sections.test.tsx`

**Interfaces:**
- Consumes: `skillCategories`, `marqueeSkills`, `education`, `profile`, `copyText`, `useToast`, `SocialLinks`, `buttonClass`, `Reveal*`, `Section`, `Tag`
- Produces: `Skills`, `Education`, `Contact`

- [ ] **Step 1: Add failing tests** — append to `src/sections/sections.test.tsx` (imports at top)

```tsx
import { vi } from 'vitest'
import { Contact } from './Contact'
import { Education } from './Education'
import { Skills } from './Skills'

describe('Skills / Education / Contact', () => {
  test('skills shows all 8 categories', () => {
    wrap(<Skills />)
    for (const label of ['Programming Languages', 'Frameworks & Libraries', 'AI / ML', 'Databases', 'DevOps & Tools', 'Cloud Technologies', 'Version Control & Tools', 'Operating Systems']) {
      expect(screen.getByRole('heading', { level: 3, name: label })).toBeInTheDocument()
    }
  })

  test('education card', () => {
    wrap(<Education />)
    expect(screen.getByText('Bachelor of Engineering in Computer Science')).toBeInTheDocument()
    expect(screen.getByText(/75\/100/)).toBeInTheDocument()
  })

  test('contact copies email and toasts', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    wrap(<Contact />)
    expect(screen.getByRole('link', { name: /satyamsoni@hotmail.co.uk/ })).toHaveAttribute('href', 'mailto:satyamsoni@hotmail.co.uk')
    fireEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(await screen.findByText('Email copied')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith('satyamsoni@hotmail.co.uk')
    expect(screen.getByText('Résumé available on request.')).toBeInTheDocument()
  })

  test('contact falls back when clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    wrap(<Contact />)
    fireEvent.click(screen.getByRole('button', { name: /copy email/i }))
    expect(await screen.findByText(/Press ⌘C/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/sections`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/sections/Skills.tsx`**

```tsx
import { RevealGroup, RevealItem } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { Tag } from '@/components/Tag'
import { marqueeSkills, skillCategories } from '@/data/skills'

export function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="Python at the core. Comfortable across the stack.">
      <div className="marquee relative -mx-4 overflow-hidden py-2 sm:-mx-6 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="marquee-track flex w-max gap-10 text-2xl font-semibold tracking-tight text-muted/70 sm:text-3xl" aria-label="Key technologies">
          {[...marqueeSkills, ...marqueeSkills].map((s, i) => (
            <li key={`${s}-${i}`} aria-hidden={i >= marqueeSkills.length}>
              {s}
            </li>
          ))}
        </ul>
      </div>
      <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((cat) => (
          <RevealItem key={cat.id} className="card p-6">
            <h3 className="font-semibold">{cat.label}</h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {cat.items.map((item) => (
                <li key={item}>
                  <Tag>{item}</Tag>
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  )
}
```

- [ ] **Step 4: Write `src/sections/Education.tsx`**

```tsx
import { GraduationCap } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { education } from '@/data/education'

export function Education() {
  return (
    <Section id="education" eyebrow="Education" title="Where it started.">
      <Reveal className="card flex flex-col gap-6 p-8 sm:flex-row sm:items-center">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <GraduationCap aria-hidden className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <h3 className="text-xl font-semibold tracking-tight">{education.degree}</h3>
          <p className="mt-1 text-muted">
            {education.school} · {education.location}
          </p>
        </div>
        <div className="text-sm text-muted sm:text-right">
          <p>{education.period}</p>
          <p className="mt-1 font-medium text-fg">Score {education.gpa}</p>
        </div>
      </Reveal>
    </Section>
  )
}
```

- [ ] **Step 5: Write `src/sections/Contact.tsx`**

```tsx
import { useRef, useState } from 'react'
import { Check, Copy, Mail } from 'lucide-react'
import { buttonClass } from '@/components/Button'
import { Reveal } from '@/components/Reveal'
import { SocialLinks } from '@/components/SocialLinks'
import { useToast } from '@/components/Toast'
import { profile } from '@/data/profile'
import { copyText } from '@/lib/clipboard'

export function Contact() {
  const toast = useToast()
  const emailRef = useRef<HTMLSpanElement>(null)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (await copyText(profile.email)) {
      setCopied(true)
      toast('Email copied')
      window.setTimeout(() => setCopied(false), 2000)
      return
    }
    if (emailRef.current) window.getSelection()?.selectAllChildren(emailRef.current)
    toast('Press ⌘C to copy')
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-28 sm:py-40">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold text-accent">Contact</p>
          <h2 id="contact-title" className="mt-3 text-display font-semibold">
            Let&apos;s build something.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-muted">{profile.contactBlurb}</p>
        </Reveal>
        <Reveal className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href={`mailto:${profile.email}`} className={buttonClass('primary')}>
            <Mail aria-hidden className="h-4 w-4" />
            <span ref={emailRef}>{profile.email}</span>
          </a>
          <button type="button" onClick={copy} aria-label="Copy email address" className={buttonClass('secondary')}>
            {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </Reveal>
        <Reveal className="mt-10 flex flex-col items-center gap-6">
          <SocialLinks />
          <p className="text-sm text-muted">{profile.resumeNote}</p>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Mount in Home** — final `src/pages/Home.tsx` body (keep the existing effect and meta hook):

```tsx
import { About } from '@/sections/About'
import { Contact } from '@/sections/Contact'
import { Education } from '@/sections/Education'
import { Experience } from '@/sections/Experience'
import { Hero } from '@/sections/Hero'
import { Projects } from '@/sections/Projects'
import { Skills } from '@/sections/Skills'
```

```tsx
    <main id="main">
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contact />
    </main>
```

- [ ] **Step 7: Run tests, typecheck, lint**

Run: `npm test && npx tsc -b && npm run lint`
Expected: PASS, no errors.

- [ ] **Step 8: Visual check in the browser**

Start the dev server via the Browser pane (`.claude/launch.json` entry `{"name":"dev","runtimeExecutable":"npm","runtimeArgs":["run","dev"],"port":5173}`), open `/`, scroll every section in light and dark (toggle), and at 375 px width. Fix any overflow or contrast issue found before committing.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(sections): skills with marquee, education card, contact with copy-to-clipboard"
```

---

### Task 11: Character asset pipeline

**Files:**
- Create: `assets-src/character/character.svg` (copied source), `scripts/build-character.mjs`
- Generated (committed): `src/assets/character/body-1x.webp`, `body-2x.webp`, `head-1x.webp`, `head-2x.webp`, `layout.json`, `public/og.png`

**Interfaces:**
- Produces `layout.json`:
  `{ frame: {w,h}, head: {x,y,w,h}, badge: {x,y,w,h}, pivot: {x,y} /* head coords */, eyes: { left:{cx,cy}, right:{cx,cy} /* head coords */, rx, ry, irisR, travelX, travelY, skin, sclera, iris, lid } }`
  All values in **frame pixels** (frame = 750×2020 crop of the 1792×2390 source); images are those pixels scaled by 0.32 (1x) and 0.64 (2x).

- [ ] **Step 1: Copy the source illustration**

```bash
mkdir -p assets-src/character
cp ~/Downloads/character_svg.svg assets-src/character/character.svg
```

- [ ] **Step 2: Write `scripts/build-character.mjs`**

```js
// Builds layered character assets from the source SVG (raster PNG + luminance mask).
// All coordinates below are in source-image pixels (1792×2390), measured from the illustration.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const SRC = 'assets-src/character/character.svg'
const OUT = 'src/assets/character'
const FRAME = { left: 540, top: 210, width: 750, height: 2020 } // full figure + margin
const HEAD = { left: 780, top: 225, width: 270, height: 375 } // hair top → neck
const BODY_CUT_Y = 548 // body layer is transparent above this row (head layer covers it)
const HEAD_FEATHER = { from: 560, to: 600 } // head alpha fades out over the neck/collar
const BADGE = { left: 700, top: 225, width: 430, height: 430 } // head + shoulders for the round badge
const PIVOT = { x: 915, y: 580 } // neck — head rotation origin
const EYES = { left: { cx: 869, cy: 426 }, right: { cx: 957, cy: 426 }, rx: 20, ry: 6.5, irisR: 7.5, travelX: 9, travelY: 2.5 }
const SKIN_SAMPLE = { x: 915, y: 330, r: 3 } // forehead
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
    <text x="80" y="340" font-size="36" fill="#a1a1a6">Technical Architect · 10+ years</text>
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
```

- [ ] **Step 3: Run the pipeline**

Run: `mkdir -p public && npm run assets`
Expected: four WebP files listed; combined size ≤ 150 KB; `skin #xxxxxx` printed; `public/og.png` and `src/assets/character/layout.json` exist.

- [ ] **Step 4: Inspect the outputs visually**

Run (writes previews to the scratchpad, not the repo):

```bash
node -e "const s=require('sharp');(async()=>{const d=process.env.TMPDIR;await s('src/assets/character/head-2x.webp').png().toFile(d+'/head.png');await s('src/assets/character/body-2x.webp').png().toFile(d+'/body.png');console.log(d)})()"
```

Open `head.png`, `body.png` and `public/og.png` with the Read tool. Expected: head layer contains the full hair, glasses and beard, fading out at the collar; body layer has nothing above the chin line; OG shows name and figure with no clipping. If the head is clipped, adjust `HEAD`/`BODY_CUT_Y` and re-run.

- [ ] **Step 5: Commit**

```bash
git add assets-src scripts src/assets public/og.png
git commit -m "feat(guide): character asset pipeline — layered WebP cut-outs, layout and OG image"
```

---

### Task 12: Guide logic (pure functions)

**Files:**
- Create: `src/guide/geometry.ts`, `src/guide/tips.ts`
- Test: `src/guide/guide.test.ts`

**Interfaces:**
- Produces:
  - `type Point = { x: number; y: number }`, `type Viewport = { w: number; h: number }`
  - `clamp(v: number, min: number, max: number): number`
  - `gaze(pointer: Point, origin: Point, vp: Viewport): { dx: number; dy: number }` — each in [-1, 1]
  - `companionTarget(pointer: Point, vp: Viewport, size: number, offset?: number, margin?: number): Point`
  - `tiltFromVelocity(vx: number, max?: number, k?: number): number`
  - `shouldFollow(pointer: Point, center: Point, resting: boolean, radius?: number): boolean`
  - `isAvoidTarget(el: EventTarget | null): boolean`
  - `TIPS: Record<string, string>`, `tipFor(context: string): string | null`, `nextTip(context: string, shown: Set<string>): string | null`

- [ ] **Step 1: Write the failing test** — `src/guide/guide.test.ts`

```ts
import { describe, expect, test } from 'vitest'
import { companionTarget, gaze, isAvoidTarget, shouldFollow, tiltFromVelocity } from './geometry'
import { nextTip, tipFor } from './tips'

const vp = { w: 1000, h: 800 }

describe('gaze', () => {
  test('normalises offset by half the viewport and clamps', () => {
    expect(gaze({ x: 750, y: 400 }, { x: 500, y: 400 }, vp)).toEqual({ dx: 0.5, dy: 0 })
    expect(gaze({ x: 5000, y: -5000 }, { x: 500, y: 400 }, vp)).toEqual({ dx: 1, dy: -1 })
  })
})

describe('companionTarget', () => {
  test('sits below-right of the pointer', () => {
    expect(companionTarget({ x: 100, y: 100 }, vp, 72)).toEqual({ x: 140, y: 140 })
  })
  test('flips left/up near the right and bottom edges', () => {
    expect(companionTarget({ x: 950, y: 780 }, vp, 72)).toEqual({ x: 838, y: 668 })
  })
  test('stays inside the viewport margin', () => {
    const t = companionTarget({ x: 0, y: 0 }, { w: 100, h: 100 }, 72)
    expect(t.x).toBeGreaterThanOrEqual(8)
    expect(t.x + 72).toBeLessThanOrEqual(100)
  })
})

describe('tiltFromVelocity', () => {
  test('scales and clamps to ±10°', () => {
    expect(tiltFromVelocity(0)).toBe(0)
    expect(tiltFromVelocity(500)).toBeCloseTo(6)
    expect(tiltFromVelocity(5000)).toBe(10)
    expect(tiltFromVelocity(-5000)).toBe(-10)
  })
})

describe('shouldFollow', () => {
  test('always follows when not resting', () => {
    expect(shouldFollow({ x: 0, y: 0 }, { x: 1, y: 1 }, false)).toBe(true)
  })
  test('when resting, stays put until the pointer moves away', () => {
    expect(shouldFollow({ x: 100, y: 100 }, { x: 150, y: 150 }, true)).toBe(false)
    expect(shouldFollow({ x: 100, y: 100 }, { x: 400, y: 100 }, true)).toBe(true)
  })
})

describe('isAvoidTarget', () => {
  test('interactive elements are avoided, guide elements are not', () => {
    document.body.innerHTML = `<a href="#"><span id="in-link">x</span></a><p id="text">t</p><div data-guide><button id="guide-btn">g</button></div>`
    expect(isAvoidTarget(document.getElementById('in-link'))).toBe(true)
    expect(isAvoidTarget(document.getElementById('text'))).toBe(false)
    expect(isAvoidTarget(document.getElementById('guide-btn'))).toBe(false)
    expect(isAvoidTarget(null)).toBe(false)
  })
})

describe('tips', () => {
  test('section and project tips, with a project default', () => {
    expect(tipFor('projects')).toMatch(/freelance/i)
    expect(tipFor('project:stryve')).toMatch(/MediaPipe/)
    expect(tipFor('project:tool-suite')).toMatch(/architecture/i)
    expect(tipFor('nowhere')).toBeNull()
  })
  test('each context is shown once', () => {
    const shown = new Set<string>()
    expect(nextTip('skills', shown)).not.toBeNull()
    expect(nextTip('skills', shown)).toBeNull()
    expect(nextTip('nowhere', shown)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/guide`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/guide/geometry.ts`**

```ts
export type Point = { x: number; y: number }
export type Viewport = { w: number; h: number }

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** Direction from `origin` to `pointer`, normalised by half the viewport, each axis in [-1, 1]. */
export function gaze(pointer: Point, origin: Point, vp: Viewport): { dx: number; dy: number } {
  return {
    dx: clamp((pointer.x - origin.x) / (vp.w / 2), -1, 1),
    dy: clamp((pointer.y - origin.y) / (vp.h / 2), -1, 1),
  }
}

/** Top-left position for the companion: below-right of the pointer, flipped near edges, kept on screen. */
export function companionTarget(pointer: Point, vp: Viewport, size: number, offset = 40, margin = 8): Point {
  let x = pointer.x + offset
  let y = pointer.y + offset
  if (x + size > vp.w - margin) x = pointer.x - offset - size
  if (y + size > vp.h - margin) y = pointer.y - offset - size
  return { x: clamp(x, margin, vp.w - size - margin), y: clamp(y, margin, vp.h - size - margin) }
}

/** Lean in the direction of travel. `vx` in px/s. */
export function tiltFromVelocity(vx: number, max = 10, k = 0.012): number {
  return clamp(vx * k, -max, max)
}

/** While resting, the companion stays put so it can be clicked — until the pointer moves away. */
export function shouldFollow(pointer: Point, center: Point, resting: boolean, radius = 160): boolean {
  if (!resting) return true
  return Math.hypot(pointer.x - center.x, pointer.y - center.y) > radius
}

const AVOID = 'a, button, input, textarea, select, label, summary, [data-guide-avoid]'

export function isAvoidTarget(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false
  if (el.closest('[data-guide]')) return false
  return el.closest(AVOID) !== null
}
```

- [ ] **Step 4: Write `src/guide/tips.ts`**

```ts
export const TIPS: Record<string, string> = {
  hero: "Hi, I'm Satyam 👋 Let me show you around.",
  about: 'Ten years across finance, telecom and real estate — here’s the short version.',
  experience: 'Click any role to read the full story.',
  projects: 'The big tiles are my freelance builds — open one for the full case study.',
  skills: 'Python is home base, but I’m comfortable across the stack.',
  education: 'Where it all started — Indore, 2016.',
  contact: 'Say hi! The copy button grabs my email in one click.',
  'project:defect-detection': '97% accuracy in under 5 seconds — on hardware the client owns.',
  'project:stryve': 'MediaPipe pose extraction, fanned out across Celery workers.',
  'project:crickbuzz': 'EMA smoothing plus backfill recovers frames the detector misses.',
  'project:*': 'Scroll down for the architecture and the results.',
}

export function tipFor(context: string): string | null {
  if (TIPS[context]) return TIPS[context]
  if (context.startsWith('project:')) return TIPS['project:*']
  return null
}

export function nextTip(context: string, shown: Set<string>): string | null {
  if (shown.has(context)) return null
  const tip = tipFor(context)
  if (tip) shown.add(context)
  return tip
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/guide`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/guide
git commit -m "feat(guide): pure geometry for gaze, follow, tilt, avoidance and contextual tips"
```

---

### Task 13: Character rendering, guide state and hero character

**Files:**
- Create: `src/guide/character.ts`, `src/guide/Character.tsx`, `src/guide/Badge.tsx`, `src/guide/SpeechBubble.tsx`, `src/guide/GuideProvider.tsx`, `src/guide/HeroCharacter.tsx`
- Modify: `src/sections/Hero.tsx` (replace the slot div), `src/pages/RootLayout.tsx` (wrap in GuideProvider), `src/sections/sections.test.tsx` (Hero test wraps GuideProvider)
- Test: `src/guide/guide.test.tsx`

**Interfaces:**
- Consumes: `layout.json`, WebP assets, `gaze`, `TIPS`, `safeGet/safeSet`, `springs`, `useMediaQuery`
- Produces:
  - `layout: CharacterLayout`, `assets: { body1x, body2x, head1x, head2x }`, `MAX_YAW = 12`, `MAX_PITCH = 8`
  - `Character({ gazeX, gazeY, headRef?, className?, sizes?, eager? })` — `gazeX/gazeY: MotionValue<number>` in [-1, 1]
  - `Badge({ gazeX, gazeY })`
  - `SpeechBubble({ text, className? })`
  - `GuideProvider({ context, children })`, `useGuide(): GuideContextValue`
    ```ts
    type GuideContextValue = {
      context: string
      hidden: boolean
      setHidden: (v: boolean) => void
      heroVisible: boolean
      setHeroVisible: (v: boolean) => void
      heroHeadRect: RefObject<DOMRect | null>
      pointer: RefObject<Point | null>
      shownTips: RefObject<Set<string>>
      menuOpen: boolean
      openMenu: () => void
      closeMenu: () => void
    }
    ```
  - `HeroCharacter()`

- [ ] **Step 1: Write the failing test** — `src/guide/guide.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { GuideProvider, useGuide } from './GuideProvider'
import { HeroCharacter } from './HeroCharacter'

function HiddenProbe() {
  const g = useGuide()
  return <p>hidden:{String(g.hidden)}</p>
}

describe('GuideProvider', () => {
  test('reads persisted hidden flag', () => {
    localStorage.setItem('guide-hidden', '1')
    render(
      <GuideProvider context="hero">
        <HiddenProbe />
      </GuideProvider>,
    )
    expect(screen.getByText('hidden:true')).toBeInTheDocument()
  })
})

describe('HeroCharacter', () => {
  test('renders layered images and greets once per session', async () => {
    const { container } = render(
      <AppProviders>
        <GuideProvider context="hero">
          <HeroCharacter />
        </GuideProvider>
      </AppProviders>,
    )
    expect(container.querySelectorAll('img')).toHaveLength(2)
    expect(await screen.findByText(/Let me show you around/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(sessionStorage.getItem('guide-greeted')).toBe('1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/guide/guide.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/guide/character.ts`**

```ts
import body1x from '@/assets/character/body-1x.webp'
import body2x from '@/assets/character/body-2x.webp'
import head1x from '@/assets/character/head-1x.webp'
import head2x from '@/assets/character/head-2x.webp'
import layoutJson from '@/assets/character/layout.json'

type Box = { x: number; y: number; w: number; h: number }
type Eye = { cx: number; cy: number }

export type CharacterLayout = {
  frame: { w: number; h: number }
  head: Box
  badge: Box
  pivot: { x: number; y: number }
  eyes: {
    left: Eye
    right: Eye
    rx: number
    ry: number
    irisR: number
    travelX: number
    travelY: number
    skin: string
    sclera: string
    iris: string
    lid: string
  }
}

export const layout = layoutJson as CharacterLayout
export const assets = { body1x, body2x, head1x, head2x }
export const MAX_YAW = 12
export const MAX_PITCH = 8

export const pct = (part: number, whole: number) => `${(part / whole) * 100}%`
```

- [ ] **Step 4: Write `src/guide/Character.tsx`**

```tsx
import { useEffect, useId, type Ref } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { cn } from '@/lib/utils'
import { assets, layout, MAX_PITCH, MAX_YAW, pct } from './character'

type Gaze = { gazeX: MotionValue<number>; gazeY: MotionValue<number> }

function Eyes({ gazeX, gazeY }: Gaze) {
  const { eyes: e, head } = layout
  const reduce = useReducedMotion()
  const ix = useTransform(gazeX, [-1, 1], [-e.travelX, e.travelX])
  const iy = useTransform(gazeY, [-1, 1], [-e.travelY, e.travelY])
  const lid = useMotionValue(0)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  useEffect(() => {
    if (reduce) return
    let timer: number
    const schedule = () => {
      timer = window.setTimeout(() => {
        animate(lid, [0, 1, 0], { duration: 0.16, ease: 'easeInOut' })
        schedule()
      }, 3000 + Math.random() * 3000)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [lid, reduce])

  return (
    <svg viewBox={`0 0 ${head.w} ${head.h}`} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      {[e.left, e.right].map((c, i) => {
        const clip = `${uid}-eye-${i}`
        return (
          <g key={clip}>
            <clipPath id={clip}>
              <ellipse cx={c.cx} cy={c.cy} rx={e.rx} ry={e.ry} />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <ellipse cx={c.cx} cy={c.cy} rx={e.rx + 1} ry={e.ry + 1} fill={e.sclera} />
              <motion.g style={{ x: ix, y: iy }}>
                <circle cx={c.cx} cy={c.cy} r={e.irisR} fill={e.iris} />
                <circle cx={c.cx} cy={c.cy} r={e.irisR * 0.45} fill="#120c09" />
                <circle cx={c.cx + e.irisR * 0.35} cy={c.cy - e.irisR * 0.35} r={1.6} fill="#fff" opacity={0.85} />
              </motion.g>
              <motion.rect
                x={c.cx - e.rx - 1}
                y={c.cy - e.ry - 1}
                width={2 * e.rx + 2}
                height={2 * e.ry + 2}
                fill={e.skin}
                style={{ scaleY: lid, originY: 0, transformBox: 'fill-box' }}
              />
            </g>
            <path
              d={`M${c.cx - e.rx} ${c.cy + 1} Q${c.cx} ${c.cy - 2 * e.ry - 1} ${c.cx + e.rx} ${c.cy + 1}`}
              stroke={e.lid}
              strokeWidth={2.2}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )
      })}
    </svg>
  )
}

type Props = Gaze & { headRef?: Ref<HTMLDivElement>; className?: string; sizes?: string; eager?: boolean }

export function Character({ gazeX, gazeY, headRef, className, sizes = '240px', eager = false }: Props) {
  const { frame, head, pivot } = layout
  const rotateY = useTransform(gazeX, [-1, 1], [-MAX_YAW, MAX_YAW])
  const rotateX = useTransform(gazeY, [-1, 1], [MAX_PITCH, -MAX_PITCH])
  const shiftX = useTransform(gazeX, [-1, 1], ['-2%', '2%'])
  const lean = useTransform(gazeX, [-1, 1], [-1.5, 1.5])

  return (
    <div className={cn('relative select-none', className)} style={{ aspectRatio: `${frame.w} / ${frame.h}` }}>
      <motion.div className="absolute inset-0" style={{ rotate: lean, originX: 0.5, originY: 1 }}>
        <div className="animate-breathe absolute inset-0">
          <img
            src={assets.body1x}
            srcSet={`${assets.body1x} 240w, ${assets.body2x} 480w`}
            sizes={sizes}
            width={240}
            height={646}
            alt=""
            draggable={false}
            decoding="async"
            fetchPriority={eager ? 'high' : 'auto'}
            className="absolute inset-0 h-full w-full"
          />
          <div
            className="absolute"
            style={{
              left: pct(head.x, frame.w),
              top: pct(head.y, frame.h),
              width: pct(head.w, frame.w),
              height: pct(head.h, frame.h),
              perspective: 800,
            }}
          >
            <motion.div
              ref={headRef}
              className="absolute inset-0"
              style={{ rotateX, rotateY, x: shiftX, transformOrigin: `${pct(pivot.x, head.w)} ${pct(pivot.y, head.h)}` }}
            >
              <img
                src={assets.head1x}
                srcSet={`${assets.head1x} 1x, ${assets.head2x} 2x`}
                alt=""
                draggable={false}
                decoding="async"
                fetchPriority={eager ? 'high' : 'auto'}
                className="absolute inset-0 h-full w-full"
              />
              <Eyes gazeX={gazeX} gazeY={gazeY} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 5: Write `src/guide/Badge.tsx` and `src/guide/SpeechBubble.tsx`**

`src/guide/Badge.tsx`:

```tsx
import type { MotionValue } from 'motion/react'
import { Character } from './Character'
import { layout } from './character'

/** Head-and-shoulders crop of the full character inside a circle. */
export function Badge({ gazeX, gazeY }: { gazeX: MotionValue<number>; gazeY: MotionValue<number> }) {
  const { frame, badge } = layout
  return (
    <div className="relative h-full w-full overflow-hidden rounded-full bg-accent/10">
      <div
        className="absolute"
        style={{
          width: `${(frame.w / badge.w) * 100}%`,
          left: `${(-badge.x / badge.w) * 100}%`,
          top: `${(-badge.y / badge.h) * 100}%`,
        }}
      >
        <Character gazeX={gazeX} gazeY={gazeY} sizes="128px" />
      </div>
    </div>
  )
}
```

`src/guide/SpeechBubble.tsx`:

```tsx
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { springs } from '@/theme/motion'

export function SpeechBubble({ text, className }: { text: string | null; className?: string }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          aria-hidden
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={springs.soft}
          className={cn(
            'glass pointer-events-none absolute w-max max-w-[240px] rounded-2xl border border-line px-4 py-2.5 text-sm leading-snug text-fg shadow-lg',
            className,
          )}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 6: Write `src/guide/GuideProvider.tsx`**

```tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { safeGet, safeRemove, safeSet } from '@/lib/storage'
import type { Point } from './geometry'

export type GuideContextValue = {
  context: string
  hidden: boolean
  setHidden: (v: boolean) => void
  heroVisible: boolean
  setHeroVisible: (v: boolean) => void
  heroHeadRect: RefObject<DOMRect | null>
  pointer: RefObject<Point | null>
  shownTips: RefObject<Set<string>>
  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
}

const GuideContext = createContext<GuideContextValue | null>(null)
const HIDDEN_KEY = 'guide-hidden'

export function GuideProvider({ context, children }: { context: string; children: ReactNode }) {
  const [hidden, setHiddenState] = useState(() => safeGet(HIDDEN_KEY) === '1')
  const [heroVisible, setHeroVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const heroHeadRect = useRef<DOMRect | null>(null)
  const pointer = useRef<Point | null>(null)
  const shownTips = useRef(new Set<string>())

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const setHidden = useCallback((v: boolean) => {
    setHiddenState(v)
    if (v) safeSet(HIDDEN_KEY, '1')
    else safeRemove(HIDDEN_KEY)
  }, [])
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const value = useMemo(
    () => ({ context, hidden, setHidden, heroVisible, setHeroVisible, heroHeadRect, pointer, shownTips, menuOpen, openMenu, closeMenu }),
    [context, hidden, setHidden, heroVisible, menuOpen, openMenu, closeMenu],
  )
  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGuide(): GuideContextValue {
  const ctx = useContext(GuideContext)
  if (!ctx) throw new Error('useGuide must be used inside <GuideProvider>')
  return ctx
}
```

- [ ] **Step 7: Write `src/guide/HeroCharacter.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { safeGet, safeSet } from '@/lib/storage'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { springs } from '@/theme/motion'
import { Character } from './Character'
import { gaze } from './geometry'
import { useGuide } from './GuideProvider'
import { TIPS } from './tips'
import { SpeechBubble } from './SpeechBubble'

export function HeroCharacter() {
  const g = useGuide()
  const { setHeroVisible, heroHeadRect, shownTips, hidden } = g
  const wrapRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, { amount: 0.25 })
  const reduce = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)')
  const gx = useMotionValue(0)
  const gy = useMotionValue(0)
  const sx = useSpring(gx, springs.gaze)
  const sy = useSpring(gy, springs.gaze)
  const [tip, setTip] = useState<string | null>(null)

  useEffect(() => {
    if (!inView && headRef.current) heroHeadRect.current = headRef.current.getBoundingClientRect()
    setHeroVisible(inView)
  }, [inView, setHeroVisible, heroHeadRect])

  useEffect(() => () => setHeroVisible(false), [setHeroVisible])

  useEffect(() => {
    if (reduce || !finePointer) return
    const onMove = (e: PointerEvent) => {
      const head = headRef.current?.getBoundingClientRect()
      if (!head) return
      const d = gaze({ x: e.clientX, y: e.clientY }, { x: head.left + head.width / 2, y: head.top + head.height / 2 }, { w: window.innerWidth, h: window.innerHeight })
      gx.set(d.dx)
      gy.set(d.dy)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce, finePointer, gx, gy])

  useEffect(() => {
    if (hidden || safeGet('guide-greeted', 'session')) return
    const show = window.setTimeout(() => {
      setTip(TIPS.hero)
      shownTips.current.add('hero')
      safeSet('guide-greeted', '1', 'session')
    }, 900)
    const hide = window.setTimeout(() => setTip(null), 6900)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [hidden, shownTips])

  return (
    <div ref={wrapRef} className="relative h-[360px] lg:h-[min(72vh,640px)]" style={{ aspectRatio: '750 / 2020' }}>
      <Character gazeX={sx} gazeY={sy} headRef={headRef} eager sizes="(min-width: 1024px) 240px, 134px" className="h-full" />
      <SpeechBubble text={tip} className="right-[62%] top-[2%]" />
    </div>
  )
}
```

- [ ] **Step 8: Use it in Hero** — in `src/sections/Hero.tsx` add `import { HeroCharacter } from '@/guide/HeroCharacter'` and replace the slot div:

```tsx
        <div className="flex justify-center lg:justify-end">
          <HeroCharacter />
        </div>
```

- [ ] **Step 9: Provide guide state in RootLayout** — replace `src/pages/RootLayout.tsx`

```tsx
import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { SECTION_IDS } from '@/data/sections'
import { GuideProvider } from '@/guide/GuideProvider'
import { startSmoothScroll } from '@/lib/scroll'
import { useActiveSection } from '@/lib/useActiveSection'

export function RootLayout() {
  const { pathname } = useLocation()
  const active = useActiveSection(SECTION_IDS, pathname)
  const projectSlug = pathname.match(/^\/projects\/([^/]+)/)?.[1]
  const context = projectSlug ? `project:${projectSlug}` : (active ?? 'hero')

  useEffect(() => startSmoothScroll(), [])

  return (
    <GuideProvider context={context}>
      <a
        href="#main"
        className="sr-only z-[70] rounded-full bg-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <Nav active={pathname === '/' ? active : null} />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </GuideProvider>
  )
}
```

- [ ] **Step 10: Hero unit test needs the provider** — in `src/sections/sections.test.tsx` change the Hero render to:

```tsx
import { GuideProvider } from '@/guide/GuideProvider'
// …
    wrap(
      <GuideProvider context="hero">
        <Hero />
      </GuideProvider>,
    )
```

- [ ] **Step 11: Run tests and typecheck**

Run: `npm test && npx tsc -b`
Expected: PASS.

- [ ] **Step 12: Browser check of the hero character**

In the Browser pane at `/`: the character stands right of the name (below it at 375 px), breathes, turns its head and eyes toward the cursor, blinks, and greets once. Zoom (`computer` zoom action) on the face and compare with the source:
- Iris must sit inside each lens and look natural; if the overlay misaligns, edit `EYES` in `scripts/build-character.mjs`, re-run `npm run assets`, reload.
- If after two adjustment rounds the eyes still look wrong, apply the spec fallback: remove `<Eyes … />` from `Character.tsx` (head rotation only) and note it in the commit message.
- No seam visible at the neck while the head turns; if visible, raise `HEAD_FEATHER.to` or lower `BODY_CUT_Y` and re-run assets.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(guide): layered character with gaze, blink and hero greeting"
```

---

### Task 14: Companion, docked mode and guide menu

**Files:**
- Create: `src/guide/Companion.tsx`, `src/guide/Docked.tsx`, `src/guide/GuideMenu.tsx`, `src/guide/GuideLayer.tsx`
- Modify: `src/pages/RootLayout.tsx` (mount GuideLayer, guide nav button, skip link), `src/guide/guide.test.tsx`

**Interfaces:**
- Consumes: `useGuide`, `Badge`, `SpeechBubble`, geometry functions, `nextTip`, `springs`, `useMediaQuery`, `useTheme`, `useToast`, `copyText`, `scrollToId`, `SECTIONS`, `profile`
- Produces: `GuideLayer()`, `GuideNavButton()` (exported from `GuideLayer.tsx`), default-exported lazy `GuideMenu`

- [ ] **Step 1: Add failing tests** — append to `src/guide/guide.test.tsx`

```tsx
import { fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { renderRoute } from '@/test/render'

describe('guide layer', () => {
  test('touch/coarse pointer: docked badge opens the guide menu', async () => {
    renderRoute('/projects/stryve')
    const badge = await screen.findByRole('button', { name: 'Open guide' })
    fireEvent.click(badge)
    expect(await screen.findByText('Where to?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Hide guide' }))
    expect(await screen.findByRole('button', { name: 'Show guide' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open guide' })).not.toBeInTheDocument()
    expect(localStorage.getItem('guide-hidden')).toBe('1')
  })

  test('works when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    renderRoute('/projects/crickbuzz')
    expect(await screen.findByRole('button', { name: 'Open guide' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
```

(Move imports to the top of the file.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/guide/guide.test.tsx`
Expected: FAIL — no "Open guide" button.

- [ ] **Step 3: Write `src/guide/Companion.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'
import { cn } from '@/lib/utils'
import { springs } from '@/theme/motion'
import { Badge } from './Badge'
import { companionTarget, gaze, isAvoidTarget, shouldFollow, tiltFromVelocity, type Point } from './geometry'
import { useGuide } from './GuideProvider'
import { SpeechBubble } from './SpeechBubble'
import { nextTip } from './tips'

const SIZE = 72
const viewport = () => ({ w: window.innerWidth, h: window.innerHeight })

function startPosition(head: DOMRect | null, pointer: Point | null): Point {
  if (head) return { x: head.left + head.width / 2 - SIZE / 2, y: Math.max(8, head.top) }
  if (pointer) return companionTarget(pointer, viewport(), SIZE)
  return { x: window.innerWidth - SIZE - 24, y: window.innerHeight - SIZE - 24 }
}

export function Companion() {
  const { context, openMenu, heroHeadRect, pointer, shownTips } = useGuide()
  const [start] = useState(() => startPosition(heroHeadRect.current, pointer.current))
  const tx = useMotionValue(start.x)
  const ty = useMotionValue(start.y)
  const x = useSpring(tx, springs.follow)
  const y = useSpring(ty, springs.follow)
  const vx = useVelocity(x)
  const tilt = useSpring(useTransform(vx, (v) => tiltFromVelocity(v)), springs.tilt)
  const gx = useMotionValue(0)
  const gy = useMotionValue(0)
  const sgx = useSpring(gx, springs.gaze)
  const sgy = useSpring(gy, springs.gaze)
  const opacity = useMotionValue(1)
  const pointerEvents = useTransform(opacity, (o) => (o < 0.5 ? 'none' : 'auto'))

  const [tip, setTip] = useState<string | null>(null)
  const [placement, setPlacement] = useState({ below: false, left: false })
  const resting = useRef(false)
  const contextRef = useRef(context)

  useEffect(() => {
    contextRef.current = context
    if (resting.current) {
      const t = nextTip(context, shownTips.current)
      if (t) setTip(t)
    }
  }, [context, shownTips])

  useEffect(() => {
    if (!tip) return
    const t = window.setTimeout(() => setTip(null), 6000)
    return () => window.clearTimeout(t)
  }, [tip])

  useEffect(() => {
    let idle: number | undefined
    let avoid = false
    let selecting = false
    let outside = false
    const fade = () => animate(opacity, avoid || selecting || outside ? 0 : 1, { duration: 0.2 })

    const moveTo = (p: Point) => {
      const t = companionTarget(p, viewport(), SIZE)
      tx.set(t.x)
      ty.set(t.y)
      setPlacement({ below: t.y < 140, left: t.x < 260 })
    }
    if (pointer.current) moveTo(pointer.current)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (outside) {
        outside = false
        fade()
      }
      const p = { x: e.clientX, y: e.clientY }
      const center = { x: x.get() + SIZE / 2, y: y.get() + SIZE / 2 }
      const d = gaze(p, center, viewport())
      gx.set(d.dx)
      gy.set(d.dy)
      if (!shouldFollow(p, center, resting.current)) return
      resting.current = false
      setTip(null)
      moveTo(p)
      window.clearTimeout(idle)
      idle = window.setTimeout(() => {
        resting.current = true
        const t = nextTip(contextRef.current, shownTips.current)
        if (t) setTip(t)
      }, 1500)
    }
    const onOver = (e: PointerEvent) => {
      avoid = isAvoidTarget(e.target)
      fade()
    }
    const onSelection = () => {
      const s = document.getSelection()
      selecting = !!s && !s.isCollapsed && s.toString().trim().length > 0
      fade()
    }
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        outside = true
        fade()
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('selectionchange', onSelection)
    document.addEventListener('mouseout', onOut)
    return () => {
      window.clearTimeout(idle)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('selectionchange', onSelection)
      document.removeEventListener('mouseout', onOut)
    }
  }, [gx, gy, opacity, pointer, shownTips, tx, ty, x, y])

  return (
    <motion.div
      data-guide
      className="fixed left-0 top-0 z-50"
      style={{ x, y, rotate: tilt, opacity, pointerEvents }}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.4, opacity: 0 }}
      transition={springs.soft}
    >
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open guide"
        className="glass block h-[72px] w-[72px] overflow-hidden rounded-full border border-line shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Badge gazeX={sgx} gazeY={sgy} />
      </button>
      <SpeechBubble
        text={tip}
        className={cn(placement.below ? 'top-full mt-3' : 'bottom-full mb-3', placement.left ? 'left-0' : 'right-0')}
      />
    </motion.div>
  )
}
```

- [ ] **Step 4: Write `src/guide/Docked.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { springs } from '@/theme/motion'
import { Badge } from './Badge'
import { useGuide } from './GuideProvider'
import { SpeechBubble } from './SpeechBubble'
import { nextTip } from './tips'

export function Docked() {
  const { context, openMenu, shownTips } = useGuide()
  const reduce = useReducedMotion()
  const hop = useMotionValue(0)
  const gx = useMotionValue(-0.5)
  const gy = useMotionValue(-0.4)
  const [tip, setTip] = useState<string | null>(null)

  useEffect(() => {
    if (!reduce) animate(hop, [0, -10, 0], { duration: 0.45, ease: 'easeOut' })
    const show = window.setTimeout(() => {
      const t = nextTip(context, shownTips.current)
      if (t) setTip(t)
    }, 800)
    return () => window.clearTimeout(show)
  }, [context, hop, reduce, shownTips])

  useEffect(() => {
    if (!tip) return
    const t = window.setTimeout(() => setTip(null), 5000)
    return () => window.clearTimeout(t)
  }, [tip])

  return (
    <motion.div
      data-guide
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50"
      style={{ y: hop }}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.4, opacity: 0 }}
      transition={springs.soft}
    >
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open guide"
        className="glass block h-16 w-16 overflow-hidden rounded-full border border-line shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Badge gazeX={gx} gazeY={gy} />
      </button>
      <SpeechBubble text={tip} className="bottom-full right-0 mb-3" />
    </motion.div>
  )
}
```

- [ ] **Step 5: Write `src/guide/GuideMenu.tsx`**

```tsx
import { useEffect, useRef, type ReactNode } from 'react'
import { Copy, EyeOff, Palette, X } from 'lucide-react'
import { useMotionValue } from 'motion/react'
import { useLocation, useNavigate } from 'react-router'
import { useToast } from '@/components/Toast'
import { profile } from '@/data/profile'
import { SECTIONS } from '@/data/sections'
import { copyText } from '@/lib/clipboard'
import { scrollToId } from '@/lib/scroll'
import { useTheme } from '@/theme/ThemeProvider'
import { Badge } from './Badge'
import { useGuide } from './GuideProvider'

const DESTINATIONS = [{ id: 'hero', label: 'Top' }, ...SECTIONS]

function Row({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-fg/[.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </button>
  )
}

export default function GuideMenu() {
  const { closeMenu, setHidden } = useGuide()
  const { pref, cycle } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ref = useRef<HTMLDialogElement>(null)
  const still = useMotionValue(0)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  const go = (id: string) => {
    closeMenu()
    if (pathname === '/' && scrollToId(id)) return
    navigate('/', { state: { scrollTo: id } })
  }

  const copy = async () => {
    toast((await copyText(profile.email)) ? 'Email copied' : profile.email)
    closeMenu()
  }

  return (
    <dialog
      ref={ref}
      aria-label="Guide menu"
      onClose={closeMenu}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close()
      }}
      className="glass m-auto w-[min(92vw,360px)] rounded-3xl border border-line p-0 text-fg shadow-2xl backdrop:bg-black/30 backdrop:backdrop-blur-sm"
    >
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0">
            <Badge gazeX={still} gazeY={still} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Where to?</p>
            <p className="text-sm text-muted">I&apos;ll take you there.</p>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close guide menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-fg/[.06]"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {DESTINATIONS.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => go(d.id)}
                className="w-full rounded-xl bg-fg/[.05] px-3 py-2.5 text-left text-sm font-medium hover:bg-fg/[.09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {d.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-line pt-3">
          <Row icon={<Palette className="h-4 w-4" />} onClick={cycle}>
            Theme: {pref[0].toUpperCase() + pref.slice(1)}
          </Row>
          <Row icon={<Copy className="h-4 w-4" />} onClick={copy}>
            Copy email
          </Row>
          <Row
            icon={<EyeOff className="h-4 w-4" />}
            onClick={() => {
              setHidden(true)
              closeMenu()
            }}
          >
            Hide guide
          </Row>
        </div>
      </div>
    </dialog>
  )
}
```

- [ ] **Step 6: Write `src/guide/GuideLayer.tsx`**

```tsx
import { lazy, Suspense } from 'react'
import { Sparkles } from 'lucide-react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import { useLocation } from 'react-router'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { Companion } from './Companion'
import { Docked } from './Docked'
import { useGuide } from './GuideProvider'

const GuideMenu = lazy(() => import('./GuideMenu'))

export function GuideLayer() {
  const { hidden, heroVisible, menuOpen } = useGuide()
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)')
  const show = !hidden && !(pathname === '/' && heroVisible)
  const follow = finePointer && !reduce

  return (
    <>
      <AnimatePresence>{show && (follow ? <Companion key="companion" /> : <Docked key="docked" />)}</AnimatePresence>
      {menuOpen && (
        <Suspense fallback={null}>
          <GuideMenu />
        </Suspense>
      )}
    </>
  )
}

export function GuideNavButton() {
  const { hidden, setHidden } = useGuide()
  if (!hidden) return null
  return (
    <button
      type="button"
      onClick={() => setHidden(false)}
      aria-label="Show guide"
      title="Show guide"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/[.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Sparkles aria-hidden className="h-[18px] w-[18px]" />
    </button>
  )
}

export function GuideSkipLink() {
  const { openMenu, hidden } = useGuide()
  if (hidden) return null
  return (
    <button
      type="button"
      onClick={openMenu}
      className="sr-only z-[70] rounded-full bg-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-40 focus:top-3"
    >
      Open guide menu
    </button>
  )
}
```

- [ ] **Step 7: Mount in RootLayout** — in `src/pages/RootLayout.tsx` add `import { GuideLayer, GuideNavButton, GuideSkipLink } from '@/guide/GuideLayer'`, then inside `<GuideProvider>`:

```tsx
      <a href="#main" className="sr-only z-[70] rounded-full bg-accent px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3">
        Skip to content
      </a>
      <GuideSkipLink />
      <Nav active={pathname === '/' ? active : null} extra={<GuideNavButton />} />
      <Outlet />
      <Footer />
      <GuideLayer />
      <ScrollRestoration />
```

- [ ] **Step 8: Run tests, typecheck, lint**

Run: `npm test && npx tsc -b && npm run lint`
Expected: PASS. Fix lint findings in this task's files (e.g. react-hooks rules) without disabling the rules globally.

- [ ] **Step 9: Browser verification (desktop + mobile)**

In the Browser pane:
1. Desktop `/`: scroll past the hero → companion springs out from the head position and trails the cursor with lag and tilt; rest the cursor 1.5 s → tip for the current section; move toward the badge → it stays put; click → menu opens; Esc closes; "Projects" scrolls there.
2. Hover a link/button → companion fades out and does not block the click; select text → fades; cursor leaves window → fades.
3. Open a case study via a card → cover morphs (Chrome); companion tip mentions the project.
4. `resize_window` preset `mobile`, reload → no companion following; docked badge bottom-right hops on section change; tap opens menu. Reset to `desktop` afterwards.
5. Emulate reduced motion via `javascript_tool` is not possible; instead verify code paths by test + temporarily toggling macOS "Reduce motion" only if the user agrees — otherwise note as unverified.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(guide): cursor-following companion, docked mode and guide menu"
```

---

### Task 15: SEO, public files, README and final verification

**Files:**
- Modify: `index.html` (full rewrite), `README.md` (full rewrite)
- Create: `public/favicon.svg`, `public/robots.txt`, `public/sitemap.xml`
- Test: `src/seo.test.ts`

**Interfaces:**
- Consumes: `projects` (for sitemap test), `public/og.png` (Task 11)

- [ ] **Step 1: Write the failing test** — `src/seo.test.ts`

```ts
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { projects } from './data/projects'

const html = readFileSync('index.html', 'utf8')
const sitemap = readFileSync('public/sitemap.xml', 'utf8')

test('index.html carries title, 10+ description, OG and favicon', () => {
  expect(html).toContain('<title>Satyam Soni — Technical Architect</title>')
  expect(html).toMatch(/name="description" content="[^"]*10\+ years/)
  expect(html).toContain('property="og:image" content="https://www.satyamsoni.com/og.png"')
  expect(html).toContain('href="/favicon.svg"')
  expect(html).not.toContain('9+')
})

test('sitemap lists home and every project', () => {
  expect(sitemap).toContain('<loc>https://www.satyamsoni.com/</loc>')
  for (const p of projects) expect(sitemap).toContain(`<loc>https://www.satyamsoni.com/projects/${p.slug}</loc>`)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/seo.test.ts`
Expected: FAIL — title/sitemap missing.

- [ ] **Step 3: Rewrite `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <script>
      (function () {
        try {
          var p = localStorage.getItem('theme');
          var dark = p === 'dark' || (p !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        } catch (e) {}
      })();
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Satyam Soni — Technical Architect</title>
    <meta name="description" content="Satyam Soni is a Technical Architect with 10+ years of experience building data platforms, AI/LLM systems and computer-vision products across finance, telecom, real estate and manufacturing." />
    <meta name="author" content="Satyam Soni" />
    <meta name="keywords" content="Technical Architect, Python, AI, LLM, GraphRAG, Computer Vision, YOLO, FastAPI, AWS, Data Engineering" />
    <link rel="canonical" href="https://www.satyamsoni.com/" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#fbfbfd" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.satyamsoni.com/" />
    <meta property="og:title" content="Satyam Soni — Technical Architect" />
    <meta property="og:description" content="10+ years building data platforms, AI systems and the teams that ship them." />
    <meta property="og:image" content="https://www.satyamsoni.com/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Satyam Soni — Technical Architect" />
    <meta name="twitter:description" content="10+ years building data platforms, AI systems and the teams that ship them." />
    <meta name="twitter:image" content="https://www.satyamsoni.com/og.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Public files**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>rect{fill:#1d1d1f}text{fill:#fff}@media (prefers-color-scheme:dark){rect{fill:#f5f5f7}text{fill:#000}}</style><rect width="64" height="64" rx="14"/><text x="32" y="42" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="27" font-weight="700" letter-spacing="-1">SS</text></svg>
```

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://www.satyamsoni.com/sitemap.xml
```

`public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.satyamsoni.com/</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/defect-detection</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/stryve</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/crickbuzz</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/fusion</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/html-parser</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/utility-framework</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/vendor-data-ingest</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/tool-suite</loc></url>
  <url><loc>https://www.satyamsoni.com/projects/certificate-renewal</loc></url>
</urlset>
```

- [ ] **Step 5: Rewrite `README.md`**

````markdown
# Satyam Soni — Portfolio

Personal portfolio of **Satyam Soni, Technical Architect** — an Apple-inspired, theme-aware site with a 2D animated guide (Satyam's illustrated character) that follows your cursor and points out what's worth seeing.

**Live:** https://www.satyamsoni.com

![Preview](public/og.png)

## Features

- Light & dark themes that follow your OS, with a manual override
- Scroll-driven reveals, parallax hero, count-up stats, animated experience timeline
- 9 project case studies (3 freelance computer-vision builds + 6 enterprise platforms) with animated architecture diagrams
- Card → case-study morph using the View Transitions API
- Guide character: head and eyes track the cursor, trails it as a companion, offers section tips, docks on touch devices, respects *Reduce motion*
- Fast: lazy-loaded routes, ~100 KB of character art, no web fonts

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Motion · React Router · Lenis · Vitest

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # production build to dist/
```

## Editing content

All content is typed data in `src/data/`:

| File | Contents |
| --- | --- |
| `profile.ts` | name, role, contact links, bio, pillars, industries |
| `experience.ts` | roles, newest first |
| `projects.ts` | case studies — services, models, tech, metrics, architecture graph |
| `skills.ts` | skill categories and the marquee list |
| `education.ts` | degree |

Guide tips live in `src/guide/tips.ts`.

## Character art

`assets-src/character/character.svg` is the source illustration. Regenerate the layered WebP files, `layout.json` and the Open Graph image with:

```bash
npm run assets
```

Crop boxes and eye positions are constants at the top of `scripts/build-character.mjs`.

## Deploy

Pushing to `main` runs `.github/workflows/vercel.yml`, which builds and deploys to Vercel production. Pull requests build only. Required secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## License

MIT © Satyam Soni
````

- [ ] **Step 6: Run the full suite, typecheck, lint, build**

Run: `npm test && npx tsc -b && npm run lint && npm run build`
Expected: all pass. In the build output, the entry chunk (`dist/assets/index-*.js`) gzip size is ≤ ~150 KB and `ProjectPage-*.js` / `GuideMenu-*.js` are separate chunks.

- [ ] **Step 7: Production preview + Lighthouse**

Add a launch entry `{"name":"preview","runtimeExecutable":"npm","runtimeArgs":["run","preview","--","--port","4173"],"port":4173}` and start it with `preview_start`. Then run:

```bash
npx --yes lighthouse http://localhost:4173/ --preset=perf --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless=new" --output=json --output-path="$TMPDIR/lh.json" && node -e "const r=require(process.env.TMPDIR+'/lh.json');for(const [k,v] of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"
```

Expected: every category ≥ 95. If below, fix the top Lighthouse opportunities (image sizing, contrast, LCP) and re-run. If Chrome is unavailable to Lighthouse, report that the audit could not run instead of claiming a score.

- [ ] **Step 8: Final browser pass**

On the preview server: hard-refresh `/projects/stryve` directly (deep link works), visit `/nope` (404), toggle theme through System/Light/Dark, check light & dark at desktop and 375 px. Take screenshots of hero (light + dark) and one case study for the user.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: SEO metadata, favicon, sitemap, OG image and new README"
```

- [ ] **Step 10: Finish the branch**

Use superpowers:finishing-a-development-branch (push `feature/revamp-v2`, open PR to `main`; merging deploys to production).
