# Portfolio Revamp v2 — Design Spec

- **Date:** 2026-10-04
- **Owner:** Satyam Soni
- **Branch:** `feature/revamp-v2`
- **Status:** Draft — awaiting review

## 1. Goal & success criteria

Replace the terminal-style portfolio with a complete rewrite that reads as the work of a 10+ year Technical Architect: Apple-grade aesthetics, cinematic but restrained motion, and an animated 2D character of Satyam who guides visitors.

Success means:

1. A visitor understands seniority (architect, AI/LLM, data, team lead) within the first screen.
2. Every piece of content from the current portfolio is present, plus the 3 freelance projects.
3. The guide character follows the cursor (desktop) and offers context tips, without ever obstructing content.
4. Theme follows the OS (light/dark) live, with a persisted manual override.
5. Lighthouse mobile ≥ 95 in Performance, Accessibility, Best Practices and SEO.
6. Pushing to `main` deploys to Vercel with the existing pipeline.

### Non-goals

- Contact form / backend APIs (mailto + copy-email instead).
- Blog.
- Downloadable résumé (current site says "available on request"; keep that line in Contact).
- 3D / WebGL.

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript + Vite (unchanged) |
| Styling | Tailwind CSS 3 with CSS-variable design tokens |
| Routing | `react-router` (v7, library mode) — `/` and `/projects/:slug` |
| Animation | `motion` (formerly Framer Motion) — springs, layout/shared-element, scroll-linked values |
| Smooth scroll | `lenis` (disabled under `prefers-reduced-motion`) |
| Tests | `vitest` + `@testing-library/react` + `jsdom` |
| Deploy | Existing GitHub Actions → Vercel workflow and `vercel.json` (SPA rewrite already present) |

**Removed:** terminal `App.tsx`/`App.css`, all `src/components/ui/*` shadcn files, and unused dependencies (Radix packages, recharts, cmdk, vaul, sonner, embla, react-day-picker, input-otp, react-hook-form, zod, date-fns, next-themes, react-resizable-panels, kimi-plugin-inspect-react, tw-animate-css, etc.). Also `netlify.toml` (`dist/` and `.vite/` are already git-ignored and untracked).

## 3. Visual language

- **Type:** system stack only — `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif`. No web font is downloaded (Apple devices get SF Pro natively). Display headings 56–96px (clamp), tracking −0.03em, weight 600–700. Body 17px / 1.5.
- **Color tokens** (CSS variables on `:root`, redefined under `[data-theme="dark"]` and `@media (prefers-color-scheme: dark)` when no override):
  - Light: `--bg #fbfbfd`, `--bg-elevated #ffffff`, `--fg #1d1d1f`, `--fg-muted #6e6e73`, `--border rgba(0,0,0,.08)`, `--accent #0071e3`.
  - Dark: `--bg #000000`, `--bg-elevated #1c1c1e`, `--fg #f5f5f7`, `--fg-muted #a1a1a6`, `--border rgba(255,255,255,.12)`, `--accent #2997ff`.
- **Surfaces:** frosted glass (`backdrop-filter: saturate(180%) blur(20px)`) for nav, guide menu, speech bubbles; cards with 24–28px radius, hairline border, soft shadow in light mode only.
- **Motion vocabulary** (all spring-based; shared presets in `src/theme/motion.ts`):
  - *Reveal*: opacity 0→1, y 24→0, blur 8px→0, staggered children 60ms.
  - *Parallax*: hero headline/subtitle layers translate at different rates with scroll.
  - *CountUp*: numeric stats animate when first in view.
  - *Shared element*: project card → case-study hero (Motion `layoutId`).
  - *Timeline fill*: experience rail fills with scroll progress.
  - **Reduced motion:** replace all of the above with 150ms opacity fades; no parallax, no smooth scroll, no cursor following.
- **Theme:** default follows OS live; nav toggle cycles System → Light → Dark, persisted in `localStorage` (wrapped in try/catch). An inline script in `index.html` sets `data-theme` before paint to avoid flash.

## 4. Information architecture

### 4.1 Home (`/`)

Fixed frosted nav: logo "SS", section links (About, Experience, Projects, Skills, Contact), theme toggle, guide re-enable button (only when guide hidden). Active section highlighted via IntersectionObserver. Mobile: links collapse into a sheet.

1. **Hero** — "Satyam Soni" / "Technical Architect" / one-line pitch ("I design data platforms, AI systems and the teams that ship them."). Full-body character to the right (below on mobile). Stats row with CountUp: **10+** years, **5** companies, **9** featured projects, **10+** engineers led. CTAs: "View work" (scroll to Projects), "Get in touch" (scroll to Contact). Location: Indore, Madhya Pradesh.
2. **About** — bio (from current data, "9+" updated to "10+"), three pillars: *Data & Platforms* (ETL, Airflow, microservices), *AI & LLMs* (GraphRAG, GPT-4o, computer vision), *Leadership* (sprint planning, guiding 10+ developers). Industries chips: Finance, Telecom, Real Estate, Manufacturing, Fitness, Sports.
3. **Experience** — vertical timeline, newest first, 5 roles. Each: company, role, location, period, description, tech tags. Collapsed shows role/company/period + first sentence; expands (accordion, animated height) to full description.
4. **Projects** — filter pills: All / Freelance / Enterprise. 9 cards; the 3 freelance are first and span larger tiles on desktop. Card: generated cover, name, tagline, client/company, 3–4 key tech tags, headline metric if any. Click → case study.
5. **Skills** — 8 categories as cards of tags (Languages, Frameworks & Libraries, AI/ML, Databases, DevOps & Tools, Cloud, Version Control & Tools, Operating Systems), tags stagger in. Above it, a slow, pausable marquee of key technologies (pauses on hover and under reduced motion).
6. **Education** — single card: B.E. Computer Science, Chamelidevi School of Engineering, Indore, Jan 2012 – Jun 2016, 75/100.
7. **Contact** — "Let's build something." Email button (opens `mailto:`) with a copy-to-clipboard button + toast, LinkedIn, GitHub, Website links. Line: "Résumé available on request." Footer: © year, "Designed & built by Satyam Soni", social icons.

### 4.2 Case study (`/projects/:slug`, lazy-loaded route)

- Cover hero (shared-element morph from card), title, tagline, type badge (Freelance / Enterprise + company).
- **Role & timeline strip:** role, team shape, platform.
- **Overview:** problem and solution paragraphs.
- **Architecture diagram:** inline SVG of services as nodes with animated connecting paths (stroke-dashoffset draw-in). Data-driven from `project.architecture` (nodes + edges). Theme-aware via tokens.
- **Services:** card per service with responsibilities.
- **Models** (if any), **Tech stack** tags.
- **Results:** large CountUp metrics.
- Prev / Next project navigation; "Back to all projects" restores scroll position on Home.
- Unknown slug → friendly 404 with link home. Route sets `document.title` and meta description.

## 5. Content

All content lives in typed modules under `src/data/`. Types:

```ts
type Project = {
  slug: string; name: string; tagline: string;
  kind: 'freelance' | 'enterprise'; company?: string;
  role: string; summary: string; problem?: string; solution?: string;
  services: { name: string; description: string; points?: string[] }[];
  models?: string[]; tech: string[];
  metrics: { value: number; suffix?: string; label: string }[];
  architecture?: { nodes: { id: string; label: string; kind: 'client'|'service'|'store'|'device'|'model' }[];
                   edges: { from: string; to: string; label?: string }[] };
  cover: CoverVariant; featured?: boolean;
};
```

### 5.1 Carried over verbatim (from current `src/App.tsx` `PORTFOLIO_DATA`)

Name, role, location, email `satyamsoni@hotmail.co.uk`, GitHub `https://github.com/satyamsoni2211`, LinkedIn `https://linkedin.com/in/-satyamsoni`, website `https://satyamsoni.in`; bio; all 8 skill categories; 5 experience entries (SenecaGlobal, HSBC, Infosys, Amdocs, Gemini Solutions) with descriptions and technologies; education; 6 enterprise projects (FUSION, HTML Parser and Extractor, Utility Framework, Vendor Data Ingest, Tool Suite, Automatic Certificate Renewal) with descriptions, tech, and metrics extracted from their descriptions (e.g. FUSION: +25% accuracy, −30% resolution time, +20% retention). Phone stays omitted (it is commented out today).

Enterprise projects have no service breakdown data; their case-study page shows Overview, Tech, Results, and an architecture diagram only where derivable from the description (FUSION: User → Fusion API → Entity disambiguation → LLM → Cypher → Neo4j; Vendor Data Ingest: Vendors → Airflow/MWAA → AWS). Others omit the diagram.

### 5.2 Freelance projects (new)

**Defect Detection** — `defect-detection`
- Tagline: Vision-based defect analysis for differential gears.
- Industry: Mechanical manufacturing. Role: Solo developer.
- Services:
  - *Camera Service* — captures images from 64 MP Arduino cameras on Raspberry Pi; reports camera health status.
  - *Defect Backend* — core workflow engine: orchestrates Camera Service, persists to DB, analyses and annotates images for defects.
  - *Defect Dashboard* — operator desktop app to trigger inspections, view verdicts and browse historical inspections.
- Model: YOLO11s (defect detection).
- Tech: FastAPI, Ultralytics, PyTorch, OpenCV, Rust, Tauri, React, SQLite.
- Metrics: 97% accuracy; ≤ 5 s end-to-end inspection; infra cost avoided via in-house deployment with regular backups (shown as text metric "In-house", label "deployment, zero cloud spend").
- Architecture: Cameras (device) → Camera Service → Defect Backend ↔ YOLO11s (model); Defect Backend → SQLite (store); Dashboard (client) ↔ Defect Backend.

**Stryve** — `stryve`
- Tagline: Guided workouts that check your pose against your trainer's.
- Industry: Fitness. Role: Lead developer.
- Services:
  - *Stryve Backend* — FastAPI; video upload; RBAC for admin, trainer and trainee; subscription-based courses.
  - *Pose Extraction Service* — core pipeline using Google MediaPipe for pose extraction; pose JSON saved to S3; generates a 3D motion-coordinate file to animate the trainer in 3D; runs on Celery workers with threaded concurrent extraction.
- Model: Google MediaPipe Pose.
- Tech: FastAPI, PyTorch, OpenCV, MediaPipe, Celery, PostgreSQL, AWS (S3, ECS, SQS, RDS).
- Metrics: 95% accuracy.
- Architecture: Apps (client) → Stryve Backend → RDS PostgreSQL; Backend → SQS → Pose Extraction (Celery on ECS) ↔ MediaPipe; Pose Extraction → S3 (pose JSON + 3D motion).

**CrickBuzz** — `crickbuzz`
- Tagline: Ball-trajectory extraction from cricket net-practice videos.
- Industry: Sports analytics. Role: Solo developer.
- Services:
  - *Extraction Service* — custom-trained YOLO26 model tracks the ball frame-by-frame; EMA smoothing and backfilling of missed frames produce a complete trajectory, used for further analysis and to build 3D replays in Unity.
- Model: YOLO26 (custom-trained).
- Tech: PyTorch, OpenCV, Ultralytics, PostgreSQL.
- Metrics: 97% accuracy.
- Architecture: Net-practice video (device) → Extraction Service ↔ YOLO26 → PostgreSQL → Unity 3D (client).

### 5.3 Project covers

No screenshots exist. Each project has a code-generated SVG cover (`src/components/ProjectCover/`), theme-aware, with a subtle idle animation on hover:
- Defect Detection: gear outline with a detection bounding box + "97%".
- Stryve: pose-skeleton stick figure mirrored (trainer vs trainee).
- CrickBuzz: pitch strip with dotted ball arc.
- Enterprise projects: abstract motifs (graph nodes for FUSION, brackets for HTML parser, pipeline for Vendor Ingest, grid for Tool Suite, lock/cert for Cert Renewal, toolbox layers for Utility Framework).

## 6. Guide character

### 6.1 Asset pipeline (one-time, script committed at `scripts/build-character.py`)

Source: `~/Downloads/character_svg.svg` — a raster (1792×2390 PNG) plus a luminance mask PNG wrapped in SVG (1.6 MB). Copy source to `assets-src/character/` (not shipped).

1. Composite PNG + mask → RGBA cut-out (Pillow).
2. Slice into layers by fixed crop boxes:
   - `head` — hair top to collar line (includes beard, glasses).
   - `body` — collar down to shoes, with the area under the head filled so head rotation never reveals gaps (neck extended slightly).
   - `shoulders` — collar/shoulder crop of the body for companion mode; the companion badge composes `shoulders` + the scaled `head` layer so the head can still turn.
   - `eyes` — pupils painted out to iris/sclera tone inside the lenses; pupil positions recorded as JSON (`eyes.json`: centers and max travel radius in head-layer coordinates).
3. Export WebP (quality ~82, alpha) at 1× and 2× display size to `src/assets/character/`. Budget: ≤ 150 KB total.

Fallback: if painted-out eyes look wrong in review, ship without the `eyes` layer and synthetic pupils; head rotation alone conveys gaze.

### 6.2 Behaviour

`GuideProvider` holds: `mode` (`hero` | `companion` | `docked` | `hidden`), current section, shown tips, pointer state. Persisted: `guideHidden`.

- **Hero mode** (hero section in view): full body; idle breathing (scaleY 1→1.01, 4 s loop); head rotates toward pointer — `rotateY ±12°`, `rotateX ±8°` with CSS perspective, spring (stiffness 120, damping 18); body leans ≤ 2°; pupils offset within radius; blink every 3–6 s (eyelid shape scaleY flash, 120 ms). Greeting bubble once per session: "Hi, I'm Satyam 👋 Let me show you around."
- **Hero → companion:** when the hero leaves the viewport, Motion `layoutId` morphs the head layer into the 72px circular badge (`shoulders` + `head`).
- **Companion mode (fine pointer):** position driven by spring toward pointer + offset (40px right/below, flipped near viewport edges); tilt = clamp(velocityX × k, ±10°); head looks at pointer. Idle ≥ 1.5 s → settle + show the tip for the current section (once per section per session). Fades to 0 when pointer is over `a, button, input, [data-guide-avoid]`, during text selection, or when pointer leaves window. Click → frosted Guide Menu: jump to sections, toggle theme, copy email, "Hide guide".
- **Docked mode** (coarse pointer / touch, or reduced motion): fixed bottom-right badge; small hop on section change; head turns toward the section's side; tap opens Guide Menu. Under reduced motion: no hop/tilt/follow, bubbles still appear.
- **Hidden:** nothing rendered; nav shows a "Show guide" button.
- Tips are data (`src/guide/tips.ts`) keyed by section id and by project slug.

### 6.3 Implementation constraints

- Pointer tracking via Motion `useMotionValue`/`useSpring` and transforms only — no React re-render per frame.
- `requestAnimationFrame`-driven work pauses on `visibilitychange` hidden.
- Guide is `aria-hidden` decoratively; Guide Menu is a proper dialog (focus trap, Esc closes, keyboard accessible via a skip-to "Open guide" button).

## 7. Performance

- Initial JS ≤ ~150 KB gzip; `ProjectPage` and `GuideMenu` lazy-loaded.
- Character layers: `<img>` with explicit width/height, `fetchpriority="high"` for hero body/head, `decoding="async"`.
- Fonts: system stack only; no font downloads.
- No layout shift: reserved aspect boxes for character and covers.
- Animations use transform/opacity only; `will-change` set only while animating.
- Lighthouse mobile ≥ 95 on all four categories.

## 8. SEO & meta

- `index.html`: title "Satyam Soni — Technical Architect", description with "10+ years", OG/Twitter tags, `theme-color` for both schemes, generated SVG favicon ("SS" monogram) and a static OG image (1200×630, generated from the hero) in `public/`.
- Per-route `document.title` updates.
- `robots.txt` and `sitemap.xml` (home + 9 project URLs) in `public/`.

## 9. Error handling

- Unknown route / slug → NotFound page.
- `localStorage` and clipboard access wrapped in try/catch; failures degrade silently (clipboard falls back to selecting text + toast "Press ⌘C").
- Lazy-route load failure → error boundary with "Reload" button.

## 10. Testing

Vitest + Testing Library:
- **Data integrity:** 9 projects; unique slugs; every project has cover, tech, ≥1 metric; 3 freelance projects present; 5 experience entries; 8 skill categories; architecture edges reference existing node ids.
- **Theme:** resolution of System/Light/Dark, persistence, storage failure tolerance.
- **Guide logic** (pure functions): companion offset/edge flipping, tilt clamp, gaze angle clamps, tip selection (once per section per session).
- **Routing:** `/projects/stryve` renders Stryve; bad slug renders NotFound.

Manual/browser verification: light & dark, desktop & 375px mobile, reduced motion, keyboard navigation of Guide Menu, Lighthouse run on `vite preview` build.

## 11. Deployment & repo hygiene

- Work on `feature/revamp-v2`; merge to `main` to deploy.
- Change `.github/workflows/vercel.yml` so `pull_request` runs build only (no `--prod` deploy); production deploy only on push to `main`.
- `vercel.json` unchanged (SPA rewrite).
- README rewritten for the new site (features, structure, how to edit `src/data/*`, deploy).
