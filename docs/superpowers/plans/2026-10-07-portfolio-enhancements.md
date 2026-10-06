# Portfolio Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Open Source, Writing and Recommendations sections, a working contact form, a cursor shooting-star trail and a glass theme with a vivid light-mode aurora; group workshops by year; replace the "Freelance" wording with "Collaborations".

**Architecture:** The site stays a static Vite + React 19 + Tailwind SPA deployed to Vercel. Every new section is a typed data file in `src/data/` plus a presentational section in `src/sections/`, registered in `src/data/sections.ts`. The contact form posts straight from the browser to Web3Forms (no backend). Visual changes are CSS tokens in `src/index.css`, one shader branch in `src/background/auroraGl.ts`, and one new canvas overlay in `src/effects/`.

**Tech Stack:** React 19, TypeScript 5.9 (strict), Tailwind 3.4, `motion` 14, `lucide-react`, Vitest 5 + Testing Library + jsdom. No new dependencies.

**Spec:** The "Design decisions" section below is the spec for this plan (agreed with Satyam in chat on 2026-10-07). Earlier site-wide design: `docs/superpowers/specs/2026-10-04-portfolio-revamp-design.md`.

**Execution method (chosen by Satyam):** subagent-driven, implementer subagents on the **Sonnet** model, one task at a time in order, each followed by a review.

## Design decisions

| # | Request | Decision |
|---|---------|----------|
| 1 | LinkedIn feedback | New **Recommendations** section fed by `src/data/recommendations.ts`. The array ships **empty** and the section renders nothing while it is empty, so no invented quotes can reach production. The real text is added in Task 5b once Satyam supplies it (LinkedIn recommendations are not publicly readable and his Brave browser could not be reached from the session). |
| 2 | Shooting star on cursor | A fixed, click-through `<canvas>` overlay draws a tapered comet tail behind the pointer plus short-lived sparks. Mouse/pen only; off for touch devices and `prefers-reduced-motion`. Animation loop sleeps when nothing is alive. |
| 3 | Contact form | Name / email / message form posting JSON to **Web3Forms** (`https://api.web3forms.com/submit`), which emails `satyamsoni@hotmail.co.uk`. Access key comes from the `VITE_WEB3FORMS_KEY` environment variable: set in the Vercel project for production and in a git-ignored `.env.local` for local runs. The key value is never committed. The form submits with `fetch`, so the Web3Forms "redirect URL" is never used and no `/thank-you` page is built. `/contact` (the form URL registered with Web3Forms) is added as a route that lands on the home page's contact section. With no key, submit opens a pre-filled `mailto:` instead. Client-side validation, honeypot field, 15 s timeout, error state keeps the typed message. The existing email + copy buttons stay. |
| 4 | Glass theme + light-mode lighting | `.card` becomes frosted glass (translucent fill, backdrop blur, light border, inner top highlight). Light-mode aurora is made vivid by (a) a stronger tint curve in the shader and (b) lowering the luminance floor from 0.84 to 0.66, paid for by darkening the light-theme `--fg-muted` and `--accent` so text still clears WCAG AA 4.5:1 (pinned by `tests/contrast.test.ts`). |
| 5 | Remove "freelance" | `Project.kind` value `'freelance'` becomes `'collaboration'`; label **Collaborations** (filter) / **Collaboration** (badge, case-study page). Roles: "Solo developer" → "Technical partner", "Lead developer" → "Lead engineer". The word "freelance" must not appear anywhere in `src/`, `README.md` or `index.html`. |
| 6 | Open source | New **Open Source** section listing the 9 packages on `https://pypi.org/user/satyamsoni2211/` (data captured 2026-10-07), grouped by year of latest release, each with summary, `pip install` line, PyPI link and (where the repo is known) a source link. |
| 7 | Year-wise segregation | A shared `YearGroups` component groups items under year headings, newest first. Applied to **Speaking** (workshops), **Open Source** and **Writing**. **Projects stay exactly as they are** (Satyam: "leave them as is" — they carry no dates). |
| 8 | Blogs | New **Writing** section with the 8 supplied links (6 dev.to, 1 LinkedIn article, 1 X article), grouped by year. The X link uses the `_satyamsoni_` handle. |

Page order after this plan: Hero · About · Experience · Projects · **Open Source** · **Writing** · Speaking · **Recommendations** · Skills · Education · Contact.

## Global Constraints

- No new npm dependencies (runtime or dev).
- Import app code through the `@/` alias (maps to `src/`), as the existing code does.
- Match the existing style: 2-space indent, no semicolons, single quotes, named exports for components.
- Every external link: `target="_blank"` and `rel="noopener noreferrer"`.
- All motion must be inert under `prefers-reduced-motion: reduce`.
- Text must keep WCAG AA contrast (4.5:1) in both themes; `tests/contrast.test.ts` must pass.
- The string "freelance" (any case) must not appear in `src/`, `README.md`, or `index.html` after Task 1.
- Never invent recommendation text, names or titles.
- Commands: `npm test` (Vitest, whole suite), `npx vitest run <file>` (one file), `npm run lint`, `npm run build`. Baseline before this plan: 13 files, 85 tests, all passing.
- Git: work on branch `feat/portfolio-enhancements`. Commit after each task. **Never push and never commit to `main`** — a push to `main` deploys to production.
- End every commit message with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Do not touch the untracked `.claude-minimax` path.

## Review Focus

1. **Web3Forms unreachable** (offline, ad-blocker, 5xx, timeout): the visitor sees an error with a direct-email link and their typed message is still in the form. Pinned in Task 6 (`sendContact` rejects/500 tests, form error test).
2. **Deploy without `VITE_WEB3FORMS_KEY`**: submitting must still reach Satyam — it opens a pre-filled `mailto:`. Pinned in Task 6.
3. **Empty recommendations**: no heading, no empty box, no nav entry. Pinned in Task 5.
4. **Touch device or reduced motion**: no trail canvas is mounted and no pointer listener is attached. Pinned in Task 8.
5. **Whitespace-only or oversized form input, and double-clicking Send**: rejected with a field message / only one request sent. Pinned in Task 6.

## File Structure

| File | Status | Responsibility |
|------|--------|----------------|
| `src/data/types.ts` | modify | `Project.kind` rename; add `OpenSourcePackage`, `Post`, `Recommendation` |
| `src/data/sections.ts` | modify | Register `opensource`, `writing`, `recommendations` |
| `src/data/opensource.ts` | create | The 9 PyPI packages |
| `src/data/writing.ts` | create | The 8 posts |
| `src/data/recommendations.ts` | create | Recommendations (empty until Task 5b) |
| `src/lib/groupByYear.ts` | create | Pure grouping helper |
| `src/lib/dates.ts` | create | `formatMonth('2026-06-07') → 'Jun 2026'` |
| `src/lib/contact.ts` | create | Validation, `mailto:` builder, Web3Forms client |
| `src/components/YearGroups.tsx` | create | Year heading + grid of items |
| `src/components/ContactForm.tsx` | create | The form UI and its states |
| `src/sections/OpenSource.tsx`, `Writing.tsx`, `Recommendations.tsx` | create | New sections |
| `src/sections/Speaking.tsx`, `Projects.tsx`, `Contact.tsx` | modify | Year groups; wording; embed form |
| `src/effects/trail.ts` | create | Pure spark physics |
| `src/effects/StarTrail.tsx` | create | Canvas overlay |
| `src/background/auroraGl.ts`, `Aurora.tsx`, `palettes.ts` | modify | Light-mode aurora; palettes for new sections |
| `src/index.css` | modify | Glass tokens, `.card`, `.field` |
| `src/env.d.ts`, `.env.example` | create | Env typing and documentation |

---

### Task 0: Branch

- [ ] **Step 1: Create the working branch**

```bash
git checkout -b feat/portfolio-enhancements
npm test
```

Expected: `Test Files  13 passed (13)` / `Tests  85 passed (85)`.

---

### Task 1: Replace "Freelance" with "Collaborations"

**Files:**
- Modify: `src/data/types.ts`, `src/data/projects.ts`, `src/sections/Projects.tsx`, `src/components/ProjectCard.tsx`, `src/pages/ProjectPage.tsx`, `src/guide/tips.ts`, `README.md`
- Test: `src/data/data.test.ts`, `src/sections/sections.test.tsx`, `src/guide/guide.test.ts`

**Interfaces:**
- Produces: `Project['kind']` is `'collaboration' | 'enterprise'`; `ProjectFilter` is `'all' | 'collaboration' | 'enterprise'`.

- [ ] **Step 1: Update the tests first**

In `src/data/data.test.ts` add `import { TIPS } from '@/guide/tips'` and replace the two freelance tests' titles/bodies:

```ts
  test('first three projects are collaborations, the rest enterprise', () => {
    expect(projects.slice(0, 3).every((p) => p.kind === 'collaboration')).toBe(true)
    expect(projects.slice(3).every((p) => p.kind === 'enterprise' && p.company)).toBe(true)
  })
```

Rename `'freelance projects carry their services and models'` to `'collaboration projects carry their services and models'` (body unchanged), and add:

```ts
  test('the word freelance appears nowhere in the content', () => {
    expect(JSON.stringify({ profile, experience, projects, TIPS })).not.toMatch(/freelanc/i)
  })

  test('collaboration roles use the agreed titles', () => {
    expect(projects.slice(0, 3).map((p) => p.role)).toEqual(['Technical partner', 'Lead engineer', 'Technical partner'])
  })
```

In `src/sections/sections.test.tsx`:

```ts
    expect(filterProjects(projects, 'collaboration').map((p) => p.slug)).toEqual(['defect-detection', 'stryve', 'crickbuzz'])
```

and in the `'cards link to case studies and filtering hides enterprise'` test:

```ts
    const collab = screen.getByRole('button', { name: 'Collaborations' })
    fireEvent.click(collab)
    expect(collab).toHaveAttribute('aria-pressed', 'true')
```

In `src/guide/guide.test.ts` line 59: `expect(tipFor('projects')).toMatch(/collaborations/i)`.

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/data/data.test.ts src/sections/sections.test.tsx src/guide/guide.test.ts`
Expected: FAIL (TypeScript/assertion errors mentioning `'collaboration'`, `Collaborations`).

- [ ] **Step 3: Implement**

- `src/data/types.ts`: `kind: 'collaboration' | 'enterprise'`.
- `src/data/projects.ts`: the three `kind: 'freelance'` → `kind: 'collaboration'`; `role` for `defect-detection` and `crickbuzz` → `'Technical partner'`; `role` for `stryve` → `'Lead engineer'`.
- `src/sections/Projects.tsx`:

```ts
export type ProjectFilter = 'all' | 'collaboration' | 'enterprise'
```
```ts
  { id: 'collaboration', label: 'Collaborations' },
```
```ts
      intro="Three recent computer-vision collaborations, plus enterprise platforms delivered at SenecaGlobal and HSBC."
```

- `src/components/ProjectCard.tsx`: rename the local `freelance` to `collab` (`project.kind === 'collaboration'`) and render `{collab ? 'Collaboration' : project.company}`.
- `src/pages/ProjectPage.tsx` (two places, around lines 55 and 69):

```tsx
    { label: project.kind === 'collaboration' ? 'Engagement' : 'Company', value: project.kind === 'collaboration' ? 'Collaboration' : project.company! },
```
```tsx
          <p className="text-sm font-semibold text-accent">{project.kind === 'collaboration' ? 'Collaboration' : project.company}</p>
```

- `src/guide/tips.ts`:

```ts
  projects: 'The big tiles are my collaborations — open one for the full case study.',
  'project:defect-detection': '97% accuracy in under 5 seconds — on hardware that stays in-house.',
```

- `README.md` line 13: `(3 computer-vision collaborations + 6 enterprise platforms)`.

- [ ] **Step 4: Verify**

```bash
npm test
grep -rni "freelanc" src README.md index.html
```

Expected: all tests pass; `grep` prints nothing.

- [ ] **Step 5: Commit**

```bash
git add -A src README.md
git commit -m "refactor: present independent builds as collaborations"
```

---

### Task 2: Section registry, year grouping, Speaking by year

**Files:**
- Create: `src/lib/groupByYear.ts`, `src/lib/groupByYear.test.ts`, `src/components/YearGroups.tsx`
- Modify: `src/data/sections.ts`, `src/background/palettes.ts`, `src/guide/tips.ts`, `src/components/Nav.tsx`, `src/sections/Speaking.tsx`
- Test: `src/data/data.test.ts`, `src/sections/sections.test.tsx`

**Interfaces:**
- Produces:
  - `groupByYear<T extends { year: number }>(items: readonly T[]): { year: number; items: T[] }[]` — newest year first, original order kept inside a year.
  - `<YearGroups items={T[]} getKey={(item: T) => string} columns?: string>{(item: T) => ReactNode}</YearGroups>` — year as an `<h3>`; item cards must therefore use `<h4>` for their titles.
  - Section ids `'opensource' | 'writing' | 'recommendations'` exist in `SECTIONS`, `PALETTES` and `TIPS`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/groupByYear.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { groupByYear } from './groupByYear'

describe('groupByYear', () => {
  test('groups newest year first and keeps item order inside a year', () => {
    const items = [
      { id: 'a', year: 2022 },
      { id: 'b', year: 2026 },
      { id: 'c', year: 2022 },
      { id: 'd', year: 2025 },
    ]
    expect(groupByYear(items)).toEqual([
      { year: 2026, items: [{ id: 'b', year: 2026 }] },
      { year: 2025, items: [{ id: 'd', year: 2025 }] },
      { year: 2022, items: [{ id: 'a', year: 2022 }, { id: 'c', year: 2022 }] },
    ])
  })

  test('empty input gives no groups', () => {
    expect(groupByYear([])).toEqual([])
  })
})
```

In `src/data/data.test.ts` replace the `'section ids are fixed'` expectation:

```ts
    expect(SECTION_IDS).toEqual([
      'hero', 'about', 'experience', 'projects', 'opensource', 'writing',
      'speaking', 'recommendations', 'skills', 'education', 'contact',
    ])
```

In `src/sections/sections.test.tsx`, inside `describe('Speaking', …)` add:

```ts
  test('groups workshops under year headings, newest first', () => {
    wrap(<Speaking />)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['2026', '2025', '2022'])
    expect(screen.getByRole('heading', { level: 4, name: 'Why Your FastAPI Is Not Fast' })).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/lib/groupByYear.test.ts src/data/data.test.ts src/sections/sections.test.tsx`
Expected: FAIL (`groupByYear` not found; section ids differ; no level-3 year headings).

- [ ] **Step 3: Implement the helper and component**

`src/lib/groupByYear.ts`:

```ts
export type YearGroup<T> = { year: number; items: T[] }

/** Buckets items by `year`, newest year first; order inside a year is preserved. */
export function groupByYear<T extends { year: number }>(items: readonly T[]): YearGroup<T>[] {
  const byYear = new Map<number, T[]>()
  for (const item of items) {
    const bucket = byYear.get(item.year)
    if (bucket) bucket.push(item)
    else byYear.set(item.year, [item])
  }
  return [...byYear.entries()].sort(([a], [b]) => b - a).map(([year, grouped]) => ({ year, items: grouped }))
}
```

`src/components/YearGroups.tsx`:

```tsx
import type { ReactNode } from 'react'
import { groupByYear } from '@/lib/groupByYear'
import { cn } from '@/lib/utils'
import { Reveal, RevealGroup, RevealItem } from './Reveal'

type Props<T extends { year: number }> = {
  items: readonly T[]
  getKey: (item: T) => string
  children: (item: T) => ReactNode
  columns?: string
}

/** Items under sticky year headings, newest year first. Item titles should be <h4>. */
export function YearGroups<T extends { year: number }>({ items, getKey, children, columns = 'sm:grid-cols-2' }: Props<T>) {
  return (
    <div className="space-y-14">
      {groupByYear(items).map((group) => (
        <div key={group.year} className="grid gap-5 lg:grid-cols-[7rem_1fr] lg:gap-8">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <h3 className="text-3xl font-semibold tracking-tight text-muted">{group.year}</h3>
          </Reveal>
          <RevealGroup as="ul" className={cn('grid gap-4', columns)}>
            {group.items.map((item) => (
              <RevealItem as="li" key={getKey(item)} pop>
                {children(item)}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Register the sections**

`src/data/sections.ts` — replace the `SECTIONS` array:

```ts
export const SECTIONS = [
  { id: 'about', label: 'About', nav: true },
  { id: 'experience', label: 'Experience', nav: true },
  { id: 'projects', label: 'Projects', nav: true },
  { id: 'opensource', label: 'Open Source', nav: true },
  { id: 'writing', label: 'Writing', nav: true },
  { id: 'speaking', label: 'Speaking', nav: true },
  { id: 'recommendations', label: 'Recommendations', nav: false },
  { id: 'skills', label: 'Skills', nav: true },
  { id: 'education', label: 'Education', nav: false },
  { id: 'contact', label: 'Contact', nav: true },
] as const
```

`src/background/palettes.ts` — add to `PALETTES` (it is `Record<SectionId, Palette>`, so the build fails without these):

```ts
  opensource: p('#2bff88', '#2a8cff', '#00d4c8'),
  writing: p('#ffb347', '#ff4bd8', '#6a5cff'),
  recommendations: p('#00c2ff', '#8a4bff', '#2bff88'),
```

`src/guide/tips.ts` — add to `TIPS`:

```ts
  opensource: 'Nine packages on PyPI — each one is a pip install away.',
  writing: 'Longer write-ups of the things I build.',
  recommendations: 'Don’t just take my word for it.',
```

`src/components/Nav.tsx` — eight nav items no longer fit at the `md` width. Change the three breakpoint classes: `hidden items-center gap-1 md:flex` → `hidden items-center gap-1 lg:flex`; the menu button's `md:hidden` → `lg:hidden`; the mobile `<motion.ul>`'s `md:hidden` → `lg:hidden`.

- [ ] **Step 5: Group Speaking by year**

Replace the JSX returned inside `<Section …>` in `src/sections/Speaking.tsx` (keep the `events`/`eventList` constants, the `now` state and the `Section` props). Remove the now-unused `RevealGroup, RevealItem` import and add `import { YearGroups } from '@/components/YearGroups'`:

```tsx
      <YearGroups items={talks} getKey={(talk) => talk.url}>
        {(talk) => (
          <TiltCard>
            <a
              href={talk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">{talk.event}</span>
                {talk.city && <span className="text-muted">{talk.city}</span>}
                <span className="ml-auto flex items-center gap-2">
                  {isUpcoming(talk, now) && (
                    <span className="rounded-full bg-accent-fill px-2.5 py-1 font-semibold text-white">Upcoming</span>
                  )}
                  <Tag>{talk.kind}</Tag>
                </span>
              </div>
              <h4 className="mt-4 text-xl font-semibold tracking-tight">{talk.title}</h4>
              {talk.subtitle && <p className="mt-2 text-muted">{talk.subtitle}</p>}
              <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-accent">
                View session
                <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </TiltCard>
        )}
      </YearGroups>
```

- [ ] **Step 6: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A src
git commit -m "feat: year-grouped workshops and registry for new sections"
```

Expected: all green.

---

### Task 3: Open Source section

**Files:**
- Create: `src/data/opensource.ts`, `src/lib/dates.ts`, `src/sections/OpenSource.tsx`, `src/sections/opensource.test.tsx`
- Modify: `src/data/types.ts`, `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `YearGroups` (Task 2), `Section`, `TiltCard`.
- Produces: `formatMonth(isoDay: string): string` in `src/lib/dates.ts` (e.g. `'2026-06-07'` → `'Jun 2026'`); `OpenSourcePackage` type; `packages: OpenSourcePackage[]`; `<OpenSource />`.

- [ ] **Step 1: Write the failing test**

Create `src/sections/opensource.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { packages } from '@/data/opensource'
import { formatMonth } from '@/lib/dates'
import { OpenSource } from './OpenSource'

describe('open source data', () => {
  test('nine unique packages, newest release first, with canonical PyPI links', () => {
    expect(packages.map((p) => p.name)).toEqual([
      'async-patcher', 'lazy-alchemy', 'fastapi-proxykit', 'eventsail', 'flask-dantic',
      'lazy-env-configurator', 'codebuild-ci', 'py-lambda-warmer', 'crypto-data-fetcher',
    ])
    const released = packages.map((p) => p.released)
    expect(released).toEqual([...released].sort().reverse())
    for (const p of packages) {
      expect(p.pypi, p.name).toBe(`https://pypi.org/project/${p.name}/`)
      expect(p.year, p.name).toBe(Number(p.released.slice(0, 4)))
      expect(p.summary.length, p.name).toBeGreaterThan(20)
      if (p.repo) expect(p.repo, p.name).toMatch(/^https:\/\/github\.com\/satyamsoni2211\//)
    }
  })
})

describe('formatMonth', () => {
  test('formats an ISO day as short month and year', () => {
    expect(formatMonth('2026-06-07')).toBe('Jun 2026')
    expect(formatMonth('2021-01-01')).toBe('Jan 2021')
  })
})

describe('OpenSource', () => {
  test('lists every package under its release year with external links', () => {
    render(<AppProviders><OpenSource /></AppProviders>)
    expect(screen.getByRole('heading', { level: 2, name: 'Libraries I maintain.' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['2026', '2024', '2023', '2022', '2021'])
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(9)
    const pypi = screen.getByRole('link', { name: 'eventsail on PyPI' })
    expect(pypi).toHaveAttribute('href', 'https://pypi.org/project/eventsail/')
    expect(pypi).toHaveAttribute('target', '_blank')
    expect(pypi.getAttribute('rel')).toContain('noopener')
    expect(screen.getByText('pip install lazy-alchemy')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'flask-dantic source on GitHub' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /All packages on PyPI/ })).toHaveAttribute('href', 'https://pypi.org/user/satyamsoni2211/')
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/sections/opensource.test.tsx`
Expected: FAIL — cannot resolve `@/data/opensource`.

- [ ] **Step 3: Add the type, the date helper and the data**

Append to `src/data/types.ts`:

```ts
export type OpenSourcePackage = {
  name: string
  summary: string
  /** Year of the latest release; drives year grouping. */
  year: number
  /** ISO day of the latest release on PyPI (YYYY-MM-DD). */
  released: string
  pypi: string
  repo?: string
}
```

`src/lib/dates.ts`:

```ts
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** '2026-06-07' → 'Jun 2026'. */
export function formatMonth(isoDay: string): string {
  return MONTH.format(new Date(`${isoDay}T00:00:00Z`))
}
```

`src/data/opensource.ts` (facts from pypi.org/user/satyamsoni2211 on 2026-10-07):

```ts
import type { OpenSourcePackage } from './types'

export const pypiProfile = 'https://pypi.org/user/satyamsoni2211/'

const pkg = (name: string, released: string, summary: string, repo?: string): OpenSourcePackage => ({
  name,
  summary,
  released,
  year: Number(released.slice(0, 4)),
  pypi: `https://pypi.org/project/${name}/`,
  repo: repo && `https://github.com/satyamsoni2211/${repo}`,
})

export const packages: OpenSourcePackage[] = [
  pkg('async-patcher', '2026-06-07', 'Patches asyncio to add to_process: offload CPU-bound callables to a separate process and get back an awaitable ProcessTask with full metadata.', 'async_patcher'),
  pkg('lazy-alchemy', '2026-05-20', 'Lazy-load SQLAlchemy table metadata on demand, with full SQLAlchemy 2, async and Pydantic support.', 'lazy_alchemy'),
  pkg('fastapi-proxykit', '2026-03-19', 'A production-ready FastAPI plugin for transparent HTTP proxying with per-route circuit breakers and OpenTelemetry observability.', 'fastapi_proxykit'),
  pkg('eventsail', '2024-04-17', 'A library for emitting events and handling them in a decoupled way.', 'eventsail'),
  pkg('flask-dantic', '2023-07-02', 'Validate Flask request models and serialise database objects using Pydantic models.'),
  pkg('lazy-env-configurator', '2023-04-27', 'Dynamic config class creation from environment variables.', 'lazy_env_configurator'),
  pkg('codebuild-ci', '2023-04-20', 'Command-line utility to trigger an AWS CodeBuild pipeline and wait for it to complete.', 'codebuild_ci'),
  pkg('py-lambda-warmer', '2022-06-14', 'Warmer utility that keeps AWS Lambda functions warm to avoid cold starts.', 'LambdaWarmerPy'),
  pkg('crypto-data-fetcher', '2021-06-04', 'Utilities for fetching crypto coin market data.'),
]
```

- [ ] **Step 4: Build the section**

`src/sections/OpenSource.tsx`:

```tsx
import { ArrowUpRight } from 'lucide-react'
import { Section } from '@/components/Section'
import { TiltCard } from '@/components/TiltCard'
import { YearGroups } from '@/components/YearGroups'
import { packages, pypiProfile } from '@/data/opensource'
import { formatMonth } from '@/lib/dates'

const LINK =
  'inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function OpenSource() {
  return (
    <Section
      id="opensource"
      eyebrow="Open Source"
      title="Libraries I maintain."
      intro={`${packages.length} Python packages published on PyPI, grouped by latest release.`}
    >
      <YearGroups items={packages} getKey={(p) => p.name}>
        {(p) => (
          <TiltCard>
            <article className="card flex h-full flex-col p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h4 className="break-all font-mono text-lg font-semibold tracking-tight">{p.name}</h4>
                <span className="text-xs text-muted">Released {formatMonth(p.released)}</span>
              </div>
              <p className="mt-3 text-muted">{p.summary}</p>
              <code className="mt-4 block overflow-x-auto whitespace-nowrap rounded-xl bg-fg/[.05] px-3 py-2 font-mono text-[13px]">
                {`pip install ${p.name}`}
              </code>
              <div className="mt-auto flex gap-5 pt-6">
                <a href={p.pypi} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} on PyPI`} className={LINK}>
                  PyPI <ArrowUpRight aria-hidden className="h-4 w-4" />
                </a>
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} source on GitHub`} className={LINK}>
                    Source <ArrowUpRight aria-hidden className="h-4 w-4" />
                  </a>
                )}
              </div>
            </article>
          </TiltCard>
        )}
      </YearGroups>
      <p className="mt-12">
        <a href={pypiProfile} target="_blank" rel="noopener noreferrer" className={LINK}>
          All packages on PyPI <ArrowUpRight aria-hidden className="h-4 w-4" />
        </a>
      </p>
    </Section>
  )
}
```

Note: keep the install line as a single template literal so it is one text node.

`src/pages/Home.tsx`: import `OpenSource` from `@/sections/OpenSource` and render `<OpenSource />` directly after `<Projects />`.

- [ ] **Step 5: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A src
git commit -m "feat: open source section with PyPI packages by year"
```

---

### Task 4: Writing section

**Files:**
- Create: `src/data/writing.ts`, `src/sections/Writing.tsx`, `src/sections/writing.test.tsx`
- Modify: `src/data/types.ts`, `src/pages/Home.tsx`

**Interfaces:**
- Consumes: `YearGroups` (Task 2), `formatMonth` (Task 3).
- Produces: `Post` type, `posts: Post[]`, `<Writing />`.

- [ ] **Step 1: Write the failing test**

Create `src/sections/writing.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { posts } from '@/data/writing'
import { Writing } from './Writing'

describe('writing data', () => {
  test('eight posts, newest first, unique https links, year matches date', () => {
    expect(posts).toHaveLength(8)
    const days = posts.map((p) => p.published)
    expect(days).toEqual([...days].sort().reverse())
    expect(new Set(posts.map((p) => p.url)).size).toBe(8)
    for (const p of posts) {
      expect(p.url, p.title).toMatch(/^https:\/\//)
      expect(p.year, p.title).toBe(Number(p.published.slice(0, 4)))
    }
    expect(posts.filter((p) => p.platform === 'dev.to')).toHaveLength(6)
    expect(posts.find((p) => p.platform === 'X')?.url).toBe('https://x.com/_satyamsoni_/status/2023652639779807338')
  })
})

describe('Writing', () => {
  test('renders each post as an external link under its year', () => {
    render(<AppProviders><Writing /></AppProviders>)
    expect(screen.getByRole('heading', { level: 2, name: 'Notes from the build.' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['2026', '2025', '2024', '2022'])
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(8)
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank')
      expect(a.getAttribute('rel')).toContain('noopener')
    }
    expect(screen.getByRole('link', { name: /How I Turned Obsidian Into a Hiring Second Brain/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/pulse/how-i-turned-obsidian-hiring-second-brain-satyam-soni-qmwac/',
    )
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/sections/writing.test.tsx`
Expected: FAIL — cannot resolve `@/data/writing`.

- [ ] **Step 3: Add the type and data**

Append to `src/data/types.ts`:

```ts
export type Post = {
  title: string
  blurb: string
  platform: 'dev.to' | 'LinkedIn' | 'X'
  /** ISO day published (YYYY-MM-DD). */
  published: string
  year: number
  url: string
}
```

`src/data/writing.ts` (titles and dates read from each platform on 2026-10-07; blurbs are one-line paraphrases):

```ts
import type { Post } from './types'

const post = (platform: Post['platform'], published: string, title: string, blurb: string, url: string): Post => ({
  title,
  blurb,
  platform,
  published,
  year: Number(published.slice(0, 4)),
  url,
})

export const posts: Post[] = [
  post(
    'LinkedIn',
    '2026-07-22',
    'How I Turned Obsidian Into a Hiring Second Brain',
    'How an Obsidian vault screens and assesses candidates, replacing the folder of PDFs and the stale spreadsheet.',
    'https://www.linkedin.com/pulse/how-i-turned-obsidian-hiring-second-brain-satyam-soni-qmwac/',
  ),
  post(
    'dev.to',
    '2026-06-08',
    "What asyncio.run_in_executor doesn't tell you (and how I fixed it)",
    'Building async_patcher, a zero-dependency library that adds to_process() to asyncio for CPU-bound work.',
    'https://dev.to/satyamsoni2211/what-asyncioruninexecutor-doesnt-tell-you-and-how-i-fixed-it-3hc5',
  ),
  post(
    'dev.to',
    '2026-05-18',
    'Stop loading tables you never use: lazy-alchemy v2 for SQLAlchemy 2, async, Pydantic, and SQLModel',
    'lazy-alchemy v2 defers SQLAlchemy table reflection to first access to cut application startup time.',
    'https://dev.to/satyamsoni2211/stop-loading-tables-you-never-use-lazy-alchemy-v2-for-sqlalchemy-2-async-pydantic-and-sqlmodel-55o5',
  ),
  post(
    'dev.to',
    '2026-05-11',
    'I Built a One-Command macOS Terminal Setup — Ghostty + Zsh + 30 Modern CLI Tools',
    'dev-accelerator sets up Ghostty, Zsh and a curated command-line toolchain with a single command.',
    'https://dev.to/satyamsoni2211/i-built-a-one-command-macos-terminal-setup-ghostty-zsh-30-modern-cli-tools-43f5',
  ),
  post(
    'X',
    '2026-02-17',
    'From Vanilla to God Mode: Build the Ultimate macOS Developer Terminal in Minutes',
    'One command, one script: why I built dev-accelerator and what it installs.',
    'https://x.com/_satyamsoni_/status/2023652639779807338',
  ),
  post(
    'dev.to',
    '2025-06-10',
    "A Developer's Guide to Mastering AI with GitHub Models: Your Free Sandbox for Innovation",
    'Using GitHub Models as a free sandbox for experimenting with AI models.',
    'https://dev.to/satyamsoni2211/a-developers-guide-to-mastering-ai-with-github-models-your-free-sandbox-for-innovation-3mni',
  ),
  post(
    'dev.to',
    '2024-04-12',
    'Introducing EventSail: A Python Library for Event-driven Programming',
    'A small library for emitting and handling events in a decoupled way.',
    'https://dev.to/satyamsoni2211/introducing-eventsail-a-python-library-for-event-driven-programming-12fo',
  ),
  post(
    'dev.to',
    '2022-07-22',
    'Extending Python Logger for mailing Exceptions',
    "Extending Python's logging so that exceptions arrive in your mailbox.",
    'https://dev.to/satyamsoni2211/extending-python-logger-for-mailing-exceptions-2hfj',
  ),
]
```

- [ ] **Step 4: Build the section**

`src/sections/Writing.tsx`:

```tsx
import { ArrowUpRight } from 'lucide-react'
import { Section } from '@/components/Section'
import { TiltCard } from '@/components/TiltCard'
import { YearGroups } from '@/components/YearGroups'
import { posts } from '@/data/writing'
import { formatMonth } from '@/lib/dates'

export function Writing() {
  return (
    <Section
      id="writing"
      eyebrow="Writing"
      title="Notes from the build."
      intro={`${posts.length} articles on Python, developer tooling and AI, published on dev.to, LinkedIn and X.`}
    >
      <YearGroups items={posts} getKey={(p) => p.url}>
        {(p) => (
          <TiltCard>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-accent">{p.platform}</span>
                <span className="text-muted">{formatMonth(p.published)}</span>
              </div>
              <h4 className="mt-4 text-lg font-semibold leading-snug tracking-tight">{p.title}</h4>
              <p className="mt-2 text-muted">{p.blurb}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-accent">
                Read article
                <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </TiltCard>
        )}
      </YearGroups>
    </Section>
  )
}
```

`src/pages/Home.tsx`: import `Writing` and render `<Writing />` directly after `<OpenSource />`.

- [ ] **Step 5: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A src
git commit -m "feat: writing section linking published articles by year"
```

---

### Task 5: Recommendations section (renders nothing while empty)

**Files:**
- Create: `src/data/recommendations.ts`, `src/sections/Recommendations.tsx`, `src/sections/recommendations.test.tsx`
- Modify: `src/data/types.ts`, `src/pages/Home.tsx`

**Interfaces:**
- Produces: `Recommendation` type; `recommendations: Recommendation[]` (empty); `<Recommendations items?: Recommendation[] />` — `items` defaults to the data file and exists so tests can inject fixtures.

- [ ] **Step 1: Write the failing test**

Create `src/sections/recommendations.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { recommendations } from '@/data/recommendations'
import type { Recommendation } from '@/data/types'
import { Recommendations } from './Recommendations'

const LONG = 'Fixture sentence for the test. '.repeat(20).trim()
const fixtures: Recommendation[] = [
  { name: 'Test Person', title: 'Engineering Manager, Example Co', relationship: 'Managed Satyam directly', date: '2024-03-01', text: 'Short fixture quote.' },
  { name: 'Second Tester', title: 'Staff Engineer, Example Co', relationship: 'Worked on the same team', text: LONG },
]

describe('Recommendations', () => {
  test('renders nothing at all when there are no recommendations', () => {
    const { container } = render(<AppProviders><Recommendations items={[]} /></AppProviders>)
    expect(container.querySelector('section')).toBeNull()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  test('shows quote, author, title and relationship, and links to LinkedIn', () => {
    render(<AppProviders><Recommendations items={fixtures} /></AppProviders>)
    expect(screen.getByRole('heading', { level: 2, name: 'In their words.' })).toBeInTheDocument()
    expect(screen.getByText('Short fixture quote.')).toBeInTheDocument()
    expect(screen.getByText('Test Person')).toBeInTheDocument()
    expect(screen.getByText('Engineering Manager, Example Co')).toBeInTheDocument()
    expect(screen.getByText(/Managed Satyam directly/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read them on LinkedIn/ })).toHaveAttribute(
      'href',
      'https://linkedin.com/in/-satyamsoni/details/recommendations/',
    )
  })

  test('only long quotes get a Read more toggle, and it expands', () => {
    render(<AppProviders><Recommendations items={fixtures} /></AppProviders>)
    const toggles = screen.getAllByRole('button', { name: 'Read more' })
    expect(toggles).toHaveLength(1)
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggles[0])
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true')
  })

  test('shipped data is well-formed', () => {
    for (const r of recommendations) {
      expect(r.name.trim().length).toBeGreaterThan(0)
      expect(r.text.trim().length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/sections/recommendations.test.tsx`
Expected: FAIL — cannot resolve `@/data/recommendations`.

- [ ] **Step 3: Type and data**

Append to `src/data/types.ts`:

```ts
export type Recommendation = {
  name: string
  /** Their headline, e.g. "Engineering Manager, Acme". */
  title: string
  /** How they know Satyam, e.g. "Managed Satyam directly". */
  relationship: string
  /** ISO day the recommendation was given (YYYY-MM-DD). */
  date?: string
  text: string
}
```

`src/data/recommendations.ts`:

```ts
import type { Recommendation } from './types'

/**
 * Recommendations received on LinkedIn, copied verbatim. The section hides itself while this is
 * empty — never add invented or paraphrased entries.
 */
export const recommendations: Recommendation[] = []
```

- [ ] **Step 4: Build the section**

`src/sections/Recommendations.tsx`:

```tsx
import { useId, useState } from 'react'
import { ArrowUpRight, Quote } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { profile } from '@/data/profile'
import { recommendations } from '@/data/recommendations'
import type { Recommendation } from '@/data/types'
import { formatMonth } from '@/lib/dates'
import { cn } from '@/lib/utils'

const LONG_QUOTE = 320

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

function RecommendationCard({ item }: { item: Recommendation }) {
  const [open, setOpen] = useState(false)
  const quoteId = useId()
  const long = item.text.length > LONG_QUOTE
  return (
    <figure className="card mb-5 break-inside-avoid p-6">
      <Quote aria-hidden className="h-6 w-6 text-accent" />
      <blockquote id={quoteId} className={cn('mt-3 whitespace-pre-line leading-relaxed', long && !open && 'line-clamp-6')}>
        {item.text}
      </blockquote>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={quoteId}
          onClick={() => setOpen((v) => !v)}
          className="mt-2 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
      <figcaption className="mt-5 flex items-center gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
          {initials(item.name)}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{item.name}</span>
          <span className="block text-sm text-muted">{item.title}</span>
          <span className="block text-xs text-muted">
            {[item.relationship, item.date && formatMonth(item.date)].filter(Boolean).join(' · ')}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

export function Recommendations({ items = recommendations }: { items?: Recommendation[] }) {
  if (items.length === 0) return null
  return (
    <Section
      id="recommendations"
      eyebrow="Recommendations"
      title="In their words."
      intro="What managers and teammates have written about working with me."
    >
      <Reveal>
        <div className="gap-5 md:columns-2">
          {items.map((item) => (
            <RecommendationCard key={`${item.name}-${item.date ?? item.text.slice(0, 24)}`} item={item} />
          ))}
        </div>
      </Reveal>
      <p className="mt-8">
        <a
          href={`${profile.linkedin}/details/recommendations/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Read them on LinkedIn <ArrowUpRight aria-hidden className="h-4 w-4" />
        </a>
      </p>
    </Section>
  )
}
```

`src/pages/Home.tsx`: import `Recommendations` and render `<Recommendations />` directly after `<Speaking />`.

- [ ] **Step 5: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A src
git commit -m "feat: recommendations section, hidden until real quotes are added"
```

### Task 5b: Fill in the real recommendations — BLOCKED on Satyam

Not for an implementer subagent. When Satyam supplies the text (pasted in chat, or readable from a browser the session can reach), the orchestrator copies each recommendation **verbatim** into `src/data/recommendations.ts`, newest first, then runs `npm test` and commits `content: add LinkedIn recommendations`. Until then the section stays hidden and nothing else is blocked.

---

### Task 6: Contact form (Web3Forms)

**Files:**
- Create: `src/lib/contact.ts`, `src/lib/contact.test.ts`, `src/components/ContactForm.tsx`, `src/components/ContactForm.test.tsx`, `src/env.d.ts`, `.env.example`
- Modify: `src/sections/Contact.tsx`, `src/index.css`, `src/guide/tips.ts`, `.gitignore`, `README.md`, `src/routes.tsx`, `src/pages/routes.test.tsx`

**Interfaces:**
- Produces (`src/lib/contact.ts`):
  - `type ContactFields = { name: string; email: string; message: string }`
  - `type ContactErrors = Partial<Record<keyof ContactFields, string>>`
  - `type SendResult = { ok: true } | { ok: false; error: string }`
  - `validateContact(fields: ContactFields): ContactErrors`
  - `mailtoHref(to: string, fields: ContactFields): string`
  - `sendContact(fields: ContactFields, accessKey: string, fetchImpl?: typeof fetch): Promise<SendResult>`
- Produces: `<ContactForm accessKey?: string send?: typeof sendContact openMail?: (href: string) => void />`. All three props default to production behaviour and exist for tests. **Tests must always pass `accessKey` explicitly** (a developer's `.env.local` must not change test results).

- [ ] **Step 1: Write the failing library tests**

Create `src/lib/contact.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest'
import { mailtoHref, sendContact, validateContact, WEB3FORMS_ENDPOINT } from './contact'

const good = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello, I would like to talk about a project.' }
const reply = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

describe('validateContact', () => {
  test('accepts a complete message', () => {
    expect(validateContact(good)).toEqual({})
  })

  test('rejects empty and whitespace-only fields', () => {
    expect(Object.keys(validateContact({ name: '   ', email: '', message: ' \n ' })).sort()).toEqual(['email', 'message', 'name'])
  })

  test('rejects malformed email addresses', () => {
    for (const email of ['ada', 'ada@', '@example.com', 'ada@example', 'a da@example.com']) {
      expect(validateContact({ ...good, email }).email, email).toBeTruthy()
    }
  })

  test('rejects a too-short message and oversized fields', () => {
    expect(validateContact({ ...good, message: 'Hi' }).message).toBeTruthy()
    expect(validateContact({ ...good, message: 'x'.repeat(5001) }).message).toBeTruthy()
    expect(validateContact({ ...good, name: 'x'.repeat(101) }).name).toBeTruthy()
  })
})

describe('mailtoHref', () => {
  test('encodes subject and body', () => {
    const href = mailtoHref('me@example.com', { ...good, message: 'Line one\nLine & two' })
    expect(href.startsWith('mailto:me@example.com?subject=')).toBe(true)
    expect(href).toContain(encodeURIComponent('Portfolio enquiry from Ada Lovelace'))
    expect(href).toContain(encodeURIComponent('Line one\nLine & two'))
    expect(href).not.toContain(' ')
  })
})

describe('sendContact', () => {
  test('posts trimmed JSON with the access key and reports success', async () => {
    const fetchImpl = reply(200, { success: true })
    const result = await sendContact({ ...good, name: '  Ada Lovelace ' }, 'key-123', fetchImpl)
    expect(result).toEqual({ ok: true })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe(WEB3FORMS_ENDPOINT)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toMatchObject({
      access_key: 'key-123',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: good.message,
      subject: 'Portfolio enquiry from Ada Lovelace',
    })
  })

  test('reports failure when the service says success: false', async () => {
    expect(await sendContact(good, 'key', reply(200, { success: false, message: 'Invalid key' }))).toMatchObject({ ok: false })
  })

  test('reports failure on a server error with a non-JSON body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }))
    expect(await sendContact(good, 'key', fetchImpl)).toMatchObject({ ok: false })
  })

  test('reports failure when the network request rejects', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const result = await sendContact(good, 'key', fetchImpl)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/email me directly/)
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx vitest run src/lib/contact.test.ts`
Expected: FAIL — cannot resolve `./contact`.

- [ ] **Step 3: Implement the library**

`src/lib/contact.ts`:

```ts
export type ContactFields = { name: string; email: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactFields, string>>
export type SendResult = { ok: true } | { ok: false; error: string }

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
export const LIMITS = { name: 100, email: 254, messageMin: 10, message: 5000 } as const
export const SEND_FAILED = "Couldn't send your message. Please try again, or email me directly."

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIMEOUT_MS = 15_000

const subjectFor = (name: string) => `Portfolio enquiry from ${name.trim()}`

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {}
  const name = fields.name.trim()
  const email = fields.email.trim()
  const message = fields.message.trim()
  if (!name) errors.name = 'Please enter your name.'
  else if (name.length > LIMITS.name) errors.name = `Keep your name under ${LIMITS.name} characters.`
  if (!email) errors.email = 'Please enter your email address.'
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = 'That email address does not look right.'
  if (message.length < LIMITS.messageMin) errors.message = `Please write at least ${LIMITS.messageMin} characters.`
  else if (message.length > LIMITS.message) errors.message = `Keep your message under ${LIMITS.message} characters.`
  return errors
}

/** Fallback when the form service is not configured: a pre-filled email draft. */
export function mailtoHref(to: string, fields: ContactFields): string {
  const body = `${fields.message.trim()}\n\n— ${fields.name.trim()} (${fields.email.trim()})`
  return `mailto:${to}?subject=${encodeURIComponent(subjectFor(fields.name))}&body=${encodeURIComponent(body)}`
}

/** Sends the message through Web3Forms, which emails it to the address the access key belongs to. */
export async function sendContact(fields: ContactFields, accessKey: string, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetchImpl(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        name: fields.name.trim(),
        email: fields.email.trim(),
        message: fields.message.trim(),
        subject: subjectFor(fields.name),
        from_name: 'satyamsoni.com',
      }),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null
    return res.ok && data?.success === true ? { ok: true } : { ok: false, error: SEND_FAILED }
  } catch {
    return { ok: false, error: SEND_FAILED }
  } finally {
    clearTimeout(timer)
  }
}
```

Run: `npx vitest run src/lib/contact.test.ts` — Expected: PASS.

- [ ] **Step 4: Write the failing form tests**

Create `src/components/ContactForm.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import type { SendResult } from '@/lib/contact'
import { ContactForm } from './ContactForm'

const fill = (name: string, email: string, message: string) => {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: message } })
}
const submit = () => fireEvent.click(screen.getByRole('button', { name: /send message/i }))
const mount = (props: Parameters<typeof ContactForm>[0]) => render(<AppProviders><ContactForm {...props} /></AppProviders>)
const MESSAGE = 'I would like to discuss a GenAI platform.'

describe('ContactForm', () => {
  test('shows field errors and sends nothing when the form is empty', () => {
    const send = vi.fn()
    mount({ accessKey: 'key', send })
    submit()
    expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-invalid', 'true')
    expect(send).not.toHaveBeenCalled()
  })

  test('sends once, confirms and clears the form on success', async () => {
    let resolve!: (r: SendResult) => void
    const send = vi.fn(() => new Promise<SendResult>((r) => (resolve = r)))
    mount({ accessKey: 'key', send })
    fill('Ada', 'ada@example.com', MESSAGE)
    submit()
    submit()
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com', message: MESSAGE }, 'key')
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
    resolve({ ok: true })
    expect(await screen.findByRole('status')).toHaveTextContent(/Thanks/)
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  test('keeps the message and offers direct email when sending fails', async () => {
    const send = vi.fn().mockResolvedValue({ ok: false, error: "Couldn't send your message. Please try again, or email me directly." })
    mount({ accessKey: 'key', send })
    fill('Ada', 'ada@example.com', MESSAGE)
    submit()
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/Couldn't send/)
    expect(screen.getByLabelText('Message')).toHaveValue(MESSAGE)
    expect(screen.getByRole('link', { name: /email me directly/i })).toHaveAttribute('href', expect.stringMatching(/^mailto:satyamsoni@hotmail\.co\.uk\?subject=/))
    expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled()
  })

  test('without an access key it opens a pre-filled email instead', () => {
    const send = vi.fn()
    const openMail = vi.fn()
    mount({ accessKey: '', send, openMail })
    fill('Ada', 'ada@example.com', MESSAGE)
    submit()
    expect(send).not.toHaveBeenCalled()
    expect(openMail).toHaveBeenCalledWith(expect.stringMatching(/^mailto:satyamsoni@hotmail\.co\.uk\?subject=/))
  })

  test('a filled honeypot is silently dropped', async () => {
    const send = vi.fn()
    const { container } = mount({ accessKey: 'key', send })
    fill('Bot', 'bot@example.com', MESSAGE)
    fireEvent.change(container.querySelector('input[name="company"]')!, { target: { value: 'Spam Ltd' } })
    submit()
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
    expect(send).not.toHaveBeenCalled()
  })
})
```

Run: `npx vitest run src/components/ContactForm.test.tsx` — Expected: FAIL (cannot resolve `./ContactForm`).

- [ ] **Step 5: Env typing, input style, the form**

`src/env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key. Public by design; without it the contact form falls back to mailto. */
  readonly VITE_WEB3FORMS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

If `npm run build` then reports duplicate `vite/client` declarations, check `tsconfig.app.json` `"types"` and keep only one source of the reference.

`.env.example` (documentation only — it must not contain a real key):

```
# Web3Forms access key (https://web3forms.com).
# Local: copy this file to .env.local (git-ignored) and paste the key.
# Production: add VITE_WEB3FORMS_KEY to the Vercel project's environment variables.
VITE_WEB3FORMS_KEY=
```

`.gitignore` — append lines `.env.local` and `.env.*.local` (the file currently has no trailing newline; add one first).

`src/index.css` — inside `@layer components { … }` add:

```css
  .field {
    @apply w-full rounded-2xl border border-line bg-elevated/60 px-4 py-3 text-fg transition-colors placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent;
  }
  .field[aria-invalid='true'] {
    border-color: rgb(220 38 38);
  }
```

`src/components/ContactForm.tsx`:

```tsx
import { useId, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { profile } from '@/data/profile'
import { LIMITS, mailtoHref, sendContact, validateContact, type ContactErrors, type ContactFields } from '@/lib/contact'
import { buttonClass } from './Button'
import { useToast } from './Toast'

const EMPTY: ContactFields = { name: '', email: '', message: '' }
const ORDER: (keyof ContactFields)[] = ['name', 'email', 'message']

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }

type Props = {
  accessKey?: string
  send?: typeof sendContact
  openMail?: (href: string) => void
}

export function ContactForm({
  accessKey = import.meta.env.VITE_WEB3FORMS_KEY ?? '',
  send = sendContact,
  openMail = (href) => window.location.assign(href),
}: Props) {
  const toast = useToast()
  const uid = useId()
  const [fields, setFields] = useState<ContactFields>(EMPTY)
  const [trap, setTrap] = useState('')
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const sending = status.kind === 'sending'
  const id = (name: string) => `${uid}-${name}`

  const set = (key: keyof ContactFields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    const found = validateContact(fields)
    setErrors(found)
    const firstBad = ORDER.find((key) => found[key])
    if (firstBad) {
      document.getElementById(id(firstBad))?.focus()
      return
    }
    // Bots fill every input; pretend it worked and send nothing.
    if (trap) {
      setFields(EMPTY)
      setStatus({ kind: 'sent' })
      return
    }
    if (!accessKey) {
      openMail(mailtoHref(profile.email, fields))
      return
    }
    setStatus({ kind: 'sending' })
    const result = await send(fields, accessKey)
    if (result.ok) {
      setFields(EMPTY)
      setStatus({ kind: 'sent' })
      toast('Message sent')
    } else {
      setStatus({ kind: 'error', message: result.error })
    }
  }

  const describe = (key: keyof ContactFields) => (errors[key] ? id(`${key}-error`) : undefined)
  const errorText = (key: keyof ContactFields) =>
    errors[key] && (
      <p id={id(`${key}-error`)} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
        {errors[key]}
      </p>
    )

  return (
    <form noValidate onSubmit={onSubmit} className="card p-6 text-left sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id('name')} className="mb-1.5 block text-sm font-medium">Name</label>
          <input
            id={id('name')}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            value={fields.name}
            onChange={set('name')}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={describe('name')}
            className="field"
          />
          {errorText('name')}
        </div>
        <div>
          <label htmlFor={id('email')} className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            value={fields.email}
            onChange={set('email')}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={describe('email')}
            className="field"
          />
          {errorText('email')}
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor={id('message')} className="mb-1.5 block text-sm font-medium">Message</label>
        <textarea
          id={id('message')}
          name="message"
          rows={5}
          maxLength={LIMITS.message}
          value={fields.message}
          onChange={set('message')}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={describe('message')}
          className="field resize-y"
        />
        {errorText('message')}
      </div>
      {/* Honeypot: hidden from people and assistive tech, irresistible to form-filling bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className={buttonClass('primary', 'disabled:cursor-not-allowed disabled:opacity-60')}>
          <Send aria-hidden className="h-4 w-4" />
          {sending ? 'Sending…' : 'Send message'}
        </button>
        {status.kind === 'sent' && (
          <p role="status" className="text-sm font-medium text-accent">
            Thanks — your message is on its way. I&apos;ll reply soon.
          </p>
        )}
        {status.kind === 'error' && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {status.message}{' '}
            <a href={mailtoHref(profile.email, fields)} className="font-medium underline">
              Email me directly
            </a>
          </p>
        )}
      </div>
    </form>
  )
}
```

Notes for the implementer:
- This project toggles dark mode with `data-theme` on `<html>`, not Tailwind's `dark:` class. Check `tailwind.config.js`: there is no `darkMode` setting, so `dark:` follows the OS, not the toggle. Replace both `text-red-600 dark:text-red-400` with a token: add `--danger: 200 30 30;` to the light `:root` block and `--danger: 255 120 120;` to **both** dark blocks in `src/index.css`, add `danger: 'rgb(var(--danger) / <alpha-value>)'` to `tailwind.config.js` colors, use `text-danger`, and change the `.field[aria-invalid='true']` rule to `border-color: rgb(var(--danger));`.
- The error-state test looks up the link by name `/email me directly/i`. The alert text itself also contains "email me directly" as plain text, which is fine — `getByRole('link', …)` only matches the anchor.

- [ ] **Step 6: Put the form in the Contact section**

In `src/sections/Contact.tsx`, import `ContactForm` from `@/components/ContactForm` and insert one new block between the heading `<Reveal>` and the email-buttons `<Reveal>`; leave everything else as is:

```tsx
        <Reveal className="mx-auto mt-12 max-w-2xl">
          <ContactForm />
        </Reveal>
        <p className="mt-10 text-sm text-muted">Prefer your own mail client?</p>
```

and change the email-buttons `Reveal` class from `mt-10 …` to `mt-4 …`.

`src/guide/tips.ts`: `contact: 'Say hi! The form lands straight in my inbox.',`

`/contact` route. Add this test to `src/pages/routes.test.tsx` first and watch it fail:

```tsx
  test('/contact lands on the home page and asks it to scroll to the contact section', async () => {
    const { router } = renderRoute('/contact')
    expect(await screen.findByRole('heading', { level: 1, name: /Satyam Soni/ })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.state).toEqual({ scrollTo: 'contact' })
  })
```

Then in `src/routes.tsx` import `Navigate` from `react-router` and add, before the `'*'` child route:

```tsx
      { path: 'contact', element: <Navigate to="/" state={{ scrollTo: 'contact' }} replace /> },
```

`Home` already scrolls to `location.state.scrollTo` on non-POP navigations, and a `replace` redirect is one.

`README.md` — add a section:

```markdown
## Contact form

The contact form posts to [Web3Forms](https://web3forms.com), which emails each message to the address the access key was created for.

The access key is read from `VITE_WEB3FORMS_KEY`.

1. Local: copy `.env.example` to `.env.local` (git-ignored) and set the key.
2. Production: add `VITE_WEB3FORMS_KEY` to the Vercel project's environment variables and redeploy.

Without a key the form still works: submitting opens a pre-filled email draft instead.
```

- [ ] **Step 7: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A src README.md .env.example .gitignore tailwind.config.js
git commit -m "feat: contact form delivering to the mailbox via Web3Forms"
```

Expected: all green, including the two pre-existing Contact tests (`mailto:` link and copy button are untouched).

---

### Task 7: Glass theme and vivid light-mode aurora

**Files:**
- Modify: `src/index.css`, `src/background/auroraGl.ts`, `src/background/Aurora.tsx`, `src/components/Tag.tsx`, `src/components/Button.ts`, `src/sections/Projects.tsx`
- Test: `tests/contrast.test.ts`

**Interfaces:**
- Produces: CSS custom properties `--card`, `--card-border`, `--card-sheen` in all three theme blocks; `LIGHT_MIN_LUM = 0.66`.

Why these numbers: text sits directly on the aurora, and the shader guarantees the page never gets darker than `LIGHT_MIN_LUM` (light) or brighter than `DARK_MAX_LUM` (dark). At 0.84 the light aurora can only ever be a near-white haze. Dropping the floor to 0.66 lets it carry real colour; to keep 4.5:1, `--fg-muted` goes 99 99 102 → 72 72 77 (6.1:1 at the floor) and `--accent` goes 0 102 204 → 0 85 170 (4.9:1). Cards must only ever *help* contrast: the light card is a white veil (raises luminance), the dark card a dark veil (lowers it).

- [ ] **Step 1: Extend the contrast test (failing)**

Append to `tests/contrast.test.ts`:

```ts
describe('glass cards never reduce text contrast', () => {
  const card = (b: string) => b.match(/--card: rgba\((\d+), (\d+), (\d+), ([\d.]+)\);/)!.slice(1).map(Number)
  const light = block(':root {')
  const dark = block(":root[data-theme='dark']")

  test('light card is a white veil: it can only raise the page luminance', () => {
    const [r, g, b, a] = card(light)
    expect(lum([r, g, b])).toBeGreaterThanOrEqual(LIGHT_MIN_LUM)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
  })

  test('dark card is a dark veil: it can only lower the page luminance', () => {
    const [r, g, b, a] = card(dark)
    expect(lum([r, g, b])).toBeLessThanOrEqual(DARK_MAX_LUM)
    expect(a).toBeGreaterThan(0)
    expect(a).toBeLessThan(1)
  })

  test('the light floor is low enough for the aurora to show colour', () => {
    expect(LIGHT_MIN_LUM).toBeLessThanOrEqual(0.7)
  })

  test('the OS-dark block matches the explicit dark theme', () => {
    const media = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'))
    const os = media.slice(media.indexOf(':root:not('), media.indexOf('}', media.indexOf(':root:not(')))
    for (const name of ['fg', 'fg-muted', 'accent']) expect(token(os, name)).toEqual(token(dark, name))
    expect(card(os)).toEqual(card(dark))
  })
})
```

Run: `npx vitest run tests/contrast.test.ts` — Expected: FAIL (`--card` not found; floor is 0.84).

- [ ] **Step 2: Tokens and glass card**

In `src/index.css`, light `:root` block — change/add:

```css
  --fg-muted: 72 72 77;
  --accent: 0 85 170;
  --glass: rgba(255, 255, 255, 0.55);
  --card: rgba(255, 255, 255, 0.5);
  --card-border: rgba(255, 255, 255, 0.75);
  --card-sheen: rgba(255, 255, 255, 0.9);
  --shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 40px rgba(15, 23, 42, 0.1);
```

In **both** dark blocks (`:root[data-theme='dark']` and the `@media (prefers-color-scheme: dark)` one — they must stay identical; also fix the mis-indented `--accent-fill` line in the media block while there) — change/add:

```css
  --glass: rgba(18, 18, 20, 0.55);
  --card: rgba(28, 28, 30, 0.5);
  --card-border: rgba(255, 255, 255, 0.14);
  --card-sheen: rgba(255, 255, 255, 0.16);
  --shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
```

Replace the `.glass` and `.card` rules:

```css
  .glass {
    background: var(--glass);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
  }
  .card {
    @apply rounded-[28px];
    background: var(--card);
    border: 1px solid var(--card-border);
    box-shadow: inset 0 1px 0 var(--card-sheen), var(--shadow);
    -webkit-backdrop-filter: saturate(170%) blur(18px);
    backdrop-filter: saturate(170%) blur(18px);
  }
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .card,
    .glass {
      background: rgb(var(--bg-elevated) / 0.92);
    }
  }
```

- [ ] **Step 3: Light-mode aurora**

`src/background/auroraGl.ts`:

```ts
export const LIGHT_MIN_LUM = 0.66 // darkest the daylight aurora may make the page
```

In the fragment shader's `if (u_light > 0.5) { … }` branch replace the first three lines (the `m`, `tint`, `outc` assignments) with:

```glsl
    // Daylight aurora: saturate quickly so the ribbons read as colour rather than haze, then lift
    // any pixel that falls under u_minLum back toward the page so dark text stays readable.
    float m = max(max(col.r, col.g), col.b);
    vec3 tint = m > 0.0 ? col / m : vec3(0.0);
    float k = 1.0 - exp(-m * 2.4);
    vec3 outc = mix(u_bg, tint, k * 0.9);
```

Leave the following `L`, `Lbg`, lift `mix` and `gl_FragColor` lines unchanged. Update the comment above the branch accordingly (drop the words "Dawn wash").

`src/background/Aurora.tsx`: in the fallback `style`, change the light opacity `0.55` → `0.85`, and update the component's doc comment to "Vivid on dark, a saturated daylight aurora on light."

- [ ] **Step 4: Glass on the small surfaces**

- `src/components/Tag.tsx`: `bg-elevated` → `bg-elevated/50`.
- `src/components/Button.ts` secondary variant: `'bg-fg/[.06] text-fg hover:bg-fg/[.1]'` → `'border border-line bg-fg/[.06] text-fg backdrop-blur-md hover:bg-fg/[.1]'`.
- `src/sections/Projects.tsx` filter container: `inline-flex rounded-full bg-fg/[.05] p-1` → `glass inline-flex rounded-full border border-line p-1`.
- Run `grep -rn "bg-elevated" src --include=*.tsx` and review each hit: surfaces that float over the aurora (menus, bubbles, panels) should use `glass` or a translucent `bg-elevated/70`; leave the filter's active pill (`bg-elevated shadow-sm`) solid so it stays legible. Do not change anything inside `src/guide/Character.tsx` (it is artwork).

- [ ] **Step 5: Verify**

```bash
npm test && npm run lint && npm run build
```

Expected: all green, including every case in `tests/contrast.test.ts`.

Visual check (implementer reports what they saw; the orchestrator re-checks in Task 9): start the dev server, and in both light and dark theme confirm (a) the light-mode aurora shows clearly coloured ribbons in the top half of the viewport, (b) cards are translucent with the aurora blurred through them, (c) muted body text is comfortably readable over the brightest ribbon, (d) scrolling stays smooth. If scrolling stutters, reduce the card blur from `18px` to `12px` and report it.

- [ ] **Step 6: Commit**

```bash
git add -A src tests
git commit -m "feat: glass surfaces and a vivid light-mode aurora"
```

---

### Task 8: Shooting-star cursor trail

**Files:**
- Create: `src/effects/trail.ts`, `src/effects/trail.test.ts`, `src/effects/StarTrail.tsx`, `src/effects/StarTrail.test.tsx`
- Modify: `src/pages/RootLayout.tsx`

**Interfaces:**
- Produces (`src/effects/trail.ts`):
  - `type Spark = { x: number; y: number; vx: number; vy: number; age: number; ttl: number; size: number; hue: number }`
  - `MAX_SPARKS = 140`
  - `emit(sparks: Spark[], x: number, y: number, dx: number, dy: number, rand?: () => number): void` — mutates `sparks`
  - `step(sparks: Spark[], dt: number): void` — mutates `sparks`, removing dead ones
- Produces: `<StarTrail />` — renders `null` unless the device has a fine pointer and motion is allowed.

- [ ] **Step 1: Write the failing physics tests**

Create `src/effects/trail.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { emit, MAX_SPARKS, step, type Spark } from './trail'

const half = () => 0.5

describe('emit', () => {
  test('ignores jitter smaller than two pixels', () => {
    const sparks: Spark[] = []
    emit(sparks, 100, 100, 1, 1, half)
    expect(sparks).toHaveLength(0)
  })

  test('faster movement sheds more sparks, up to four per move', () => {
    const slow: Spark[] = []
    const fast: Spark[] = []
    emit(slow, 100, 100, 5, 0, half)
    emit(fast, 100, 100, 200, 0, half)
    expect(slow).toHaveLength(1)
    expect(fast).toHaveLength(4)
  })

  test('sparks drift backwards along the path, behind the pointer', () => {
    const sparks: Spark[] = []
    emit(sparks, 100, 100, 40, 0, half)
    for (const s of sparks) {
      expect(s.vx).toBeLessThan(0)
      expect(s.x).toBeLessThanOrEqual(100)
    }
  })

  test('never holds more than MAX_SPARKS', () => {
    const sparks: Spark[] = []
    for (let i = 0; i < 200; i++) emit(sparks, i, 0, 200, 0, half)
    expect(sparks).toHaveLength(MAX_SPARKS)
  })
})

describe('step', () => {
  test('moves sparks and removes them once their time is up', () => {
    const sparks: Spark[] = [{ x: 0, y: 0, vx: 100, vy: 0, age: 0, ttl: 0.5, size: 1, hue: 0 }]
    step(sparks, 0.1)
    expect(sparks[0].x).toBeGreaterThan(0)
    expect(sparks[0].age).toBeCloseTo(0.1)
    step(sparks, 0.5)
    expect(sparks).toHaveLength(0)
  })
})
```

Run: `npx vitest run src/effects/trail.test.ts` — Expected: FAIL (cannot resolve `./trail`).

- [ ] **Step 2: Implement the physics**

`src/effects/trail.ts`:

```ts
export type Spark = { x: number; y: number; vx: number; vy: number; age: number; ttl: number; size: number; hue: number }

export const MAX_SPARKS = 140
const MIN_MOVE = 2 // px; below this the pointer is only jittering
const DRAG = 2.5 // per second

/** Sheds sparks behind a pointer that just moved by (dx, dy) to (x, y). Mutates `sparks`. */
export function emit(sparks: Spark[], x: number, y: number, dx: number, dy: number, rand: () => number = Math.random): void {
  const dist = Math.hypot(dx, dy)
  if (dist < MIN_MOVE) return
  const ux = dx / dist
  const uy = dy / dist
  const count = Math.min(4, 1 + Math.floor(dist / 14))
  for (let i = 0; i < count; i++) {
    const back = rand() * dist // somewhere along the segment just travelled
    const speed = 30 + rand() * 70
    const spread = (rand() - 0.5) * 60
    sparks.push({
      x: x - ux * back,
      y: y - uy * back,
      vx: -ux * speed - uy * spread,
      vy: -uy * speed + ux * spread,
      age: 0,
      ttl: 0.45 + rand() * 0.45,
      size: 0.8 + rand() * 1.6,
      hue: Math.floor(rand() * 4),
    })
  }
  if (sparks.length > MAX_SPARKS) sparks.splice(0, sparks.length - MAX_SPARKS)
}

/** Advances every spark by `dt` seconds and drops the expired ones. Mutates `sparks`. */
export function step(sparks: Spark[], dt: number): void {
  const keep = Math.exp(-DRAG * dt)
  let alive = 0
  for (const s of sparks) {
    s.age += dt
    if (s.age >= s.ttl) continue
    s.x += s.vx * dt
    s.y += s.vy * dt
    s.vx *= keep
    s.vy *= keep
    sparks[alive++] = s
  }
  sparks.length = alive
}
```

Run: `npx vitest run src/effects/trail.test.ts` — Expected: PASS.

- [ ] **Step 3: Write the failing component tests**

Create `src/effects/StarTrail.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AppProviders } from '@/AppProviders'
import { StarTrail } from './StarTrail'

const media = (matching: string[]) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  )

afterEach(() => vi.restoreAllMocks())

const mount = () => render(<AppProviders><StarTrail /></AppProviders>)

describe('StarTrail', () => {
  test('mounts a click-through, hidden-from-AT canvas for mouse users', () => {
    media(['(pointer: fine)'])
    const { container } = mount()
    const canvas = container.querySelector('canvas')!
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas.className).toContain('pointer-events-none')
  })

  test('renders nothing and listens to nothing on touch devices', () => {
    media([])
    const add = vi.spyOn(window, 'addEventListener')
    const { container } = mount()
    expect(container.querySelector('canvas')).toBeNull()
    expect(add.mock.calls.some(([type]) => type === 'pointermove')).toBe(false)
  })

  test('renders nothing when the visitor prefers reduced motion', () => {
    media(['(pointer: fine)', '(prefers-reduced-motion: reduce)'])
    const { container } = mount()
    expect(container.querySelector('canvas')).toBeNull()
  })

  test('removes its listeners on unmount', () => {
    media(['(pointer: fine)'])
    const remove = vi.spyOn(window, 'removeEventListener')
    mount().unmount()
    expect(remove.mock.calls.some(([type]) => type === 'pointermove')).toBe(true)
  })
})
```

Notes: jsdom's `canvas.getContext` returns `null` (stubbed in `src/test/setup.ts`), so the component must treat a null context as "draw nothing" while still attaching and removing its listeners. Reduced motion is read with the project's own `useMediaQuery` hook, not `useReducedMotion` from `motion` — that hook caches its first answer for the whole test file, which would make the reduced-motion test meaningless.

Run: `npx vitest run src/effects/StarTrail.test.tsx` — Expected: FAIL (cannot resolve `./StarTrail`).

- [ ] **Step 4: Implement the overlay**

`src/effects/StarTrail.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { useTheme } from '@/theme/ThemeProvider'
import { emit, step, type Spark } from './trail'

type Point = { x: number; y: number; t: number }

const TAIL_MS = 220 // how long the comet's tail lingers
const DARK = { head: '255, 255, 255', sparks: ['255, 255, 255', '43, 255, 136', '0, 212, 200', '138, 75, 255'] }
const LIGHT = { head: '0, 85, 170', sparks: ['0, 113, 227', '138, 75, 255', '0, 150, 140', '214, 51, 170'] }

/** Shooting-star trail behind the mouse. Mouse/pen only; absent for touch and reduced motion. */
export function StarTrail() {
  const fine = useMediaQuery('(pointer: fine)')
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  if (!fine || reduce) return null
  return <TrailCanvas />
}

function TrailCanvas() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const darkRef = useRef(theme === 'dark')

  useEffect(() => {
    darkRef.current = theme === 'dark'
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d') ?? null
    const sparks: Spark[] = []
    let tail: Point[] = []
    let raf = 0
    let lastFrame = 0
    let prev: { x: number; y: number } | null = null

    const resize = () => {
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      if (!canvas || !ctx) return
      const dt = Math.min(0.05, (now - lastFrame) / 1000)
      lastFrame = now
      step(sparks, dt)
      tail = tail.filter((p) => now - p.t < TAIL_MS)

      const colours = darkRef.current ? DARK : LIGHT
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.globalCompositeOperation = darkRef.current ? 'lighter' : 'source-over'
      ctx.lineCap = 'round'

      // Tail: tapered and fading toward its oldest point.
      for (let i = 1; i < tail.length; i++) {
        const f = i / tail.length
        ctx.strokeStyle = `rgba(${colours.head}, ${f * f * 0.85})`
        ctx.lineWidth = 0.5 + f * 3
        ctx.beginPath()
        ctx.moveTo(tail[i - 1].x, tail[i - 1].y)
        ctx.lineTo(tail[i].x, tail[i].y)
        ctx.stroke()
      }

      // Head: a soft glow at the newest point.
      const head = tail[tail.length - 1]
      if (head && tail.length > 1) {
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12)
        glow.addColorStop(0, `rgba(${colours.head}, 0.9)`)
        glow.addColorStop(1, `rgba(${colours.head}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const s of sparks) {
        const life = 1 - s.age / s.ttl
        ctx.fillStyle = `rgba(${colours.sparks[s.hue]}, ${life * 0.9})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * (0.4 + life * 0.6), 0, Math.PI * 2)
        ctx.fill()
      }

      if (sparks.length > 0 || tail.length > 0) raf = requestAnimationFrame(draw)
      else {
        raf = 0
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!ctx || e.pointerType === 'touch') return
      const now = performance.now()
      if (prev) emit(sparks, e.clientX, e.clientY, e.clientX - prev.x, e.clientY - prev.y)
      prev = { x: e.clientX, y: e.clientY }
      tail.push({ x: e.clientX, y: e.clientY, t: now })
      if (!raf) {
        lastFrame = now
        raf = requestAnimationFrame(draw)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] h-full w-full" />
}
```

The "touch devices" test asserts no `pointermove` listener is added: that holds because `StarTrail` returns `null` before `TrailCanvas` (and its effect) ever mounts.

`src/pages/RootLayout.tsx`: `import { StarTrail } from '@/effects/StarTrail'` and render `<StarTrail />` on the line after `<Aurora context={context} />`. Layering: the nav is `z-40`, toasts `z-[60]`; the trail at `z-[45]` draws over the page and nav but under toasts, and never intercepts clicks.

- [ ] **Step 5: Verify and commit**

```bash
npm test && npm run lint && npm run build
git add -A src
git commit -m "feat: shooting-star trail that follows the cursor"
```

Manual check: run the dev server, move the mouse — a tapered streak with a glowing head follows the cursor and sheds sparks that fade within a second; links and buttons under the trail still click; in light theme the trail is blue/violet and clearly visible; when the mouse stops, the canvas goes blank within ~1 s.

---

### Task 9: Whole-branch verification (orchestrator, not a subagent)

- [ ] **Step 1: Automated gates**

```bash
npm test && npm run lint && npm run build
grep -rni "freelanc" src README.md index.html
```

Expected: tests, lint and build green; `grep` prints nothing.

- [ ] **Step 2: Browser verification** using the `dev` preview server (`.claude/launch.json`), in dark and light theme, at desktop width and at 375 px:

| Check | Expected |
|-------|----------|
| Page order | Hero · About · Experience · Projects · Open Source · Writing · Speaking · Skills · Education · Contact (Recommendations absent while data is empty) |
| Nav | 8 links on wide screens; hamburger below `lg`; each link scrolls to its section |
| Projects | Filter reads All / Collaborations / Enterprise; a collaboration case-study page shows "Engagement: Collaboration" |
| Speaking / Open Source / Writing | Year headings newest first; every card link opens the right URL in a new tab |
| Contact form | Empty submit shows three field errors and focuses Name; with no key, a valid submit opens a mail draft |
| Glass | Cards translucent with blurred aurora behind; text readable everywhere |
| Light aurora | Clearly coloured ribbons, not a faint haze |
| Cursor trail | Visible in both themes; absent at 375 px touch emulation |
| Console | No errors or warnings |

- [ ] **Step 3: Report** to Satyam with screenshots of light and dark, the list of commits, and the two things only he can do: supply the LinkedIn recommendations (Task 5b), and set `VITE_WEB3FORMS_KEY` in Vercel and in `.env.local`, then send one real test message. Merging to `main` (which deploys) waits for his go-ahead.

---

## Self-review notes

- **Spec coverage:** decisions 1→Task 5/5b, 2→Task 8, 3→Task 6, 4→Task 7, 5→Task 1, 6→Task 3, 7→Tasks 2–4, 8→Task 4.
- **Type consistency:** `formatMonth` is created in Task 3 and consumed in Tasks 4 and 5; `YearGroups` is created in Task 2 and consumed in Tasks 3 and 4; section ids `opensource` / `writing` / `recommendations` are used identically in `sections.ts`, `palettes.ts`, `tips.ts` and each section's `id`.
- **Known open inputs:** recommendation text (Task 5b). It blocks no implementer task.
