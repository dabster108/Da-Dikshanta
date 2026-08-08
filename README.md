# Dikshanta Chapagain — Portfolio

A scroll-driven portfolio for AI / ML / computer-vision work, built as one
continuous chapter sequence rather than a stack of sections.

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind** — every colour resolves to a CSS custom property in `src/index.css`
- **Lenis + GSAP ScrollTrigger** — one scroll system, one RAF loop
- **React Three Fiber / three.js** — a single lazy-loaded WebGL canvas behind the whole document
- **React Router** — `/` and `/work/:slug`

## Local development

```bash
npm install
npm run dev      # vite + the contact API dev server
npm run build
npm run preview
```

Node 18+.

## How it fits together

### The scroll system

`src/lib/animation/ScrollController.tsx` is the only place Lenis is created,
and it is driven from `gsap.ticker` so there is exactly one requestAnimationFrame
loop on the page. It owns four things and nothing else:

1. the Lenis instance
2. writing scroll position, velocity and pointer into `sceneState`
3. crossfading the page ground between chapter colours
4. publishing the active chapter to React (at chapter-change frequency, not per frame)

Under `prefers-reduced-motion` Lenis is never constructed; native scroll drives
ScrollTrigger, and each component skips its own scrubbed transforms.

### Scroll → 3D

`src/lib/animation/sceneState.ts` is a plain mutable object, deliberately not
React state. Scroll updates at frame rate and only the render loop consumes
those values, so routing them through React would re-render the tree ~60×/sec
for nothing. `useFrame` reads it; React never sees it.

`cameraPath.ts` is the storyboard — one entry per chapter giving camera
position, artifact placement, lighting mood and opacity. `CameraRig` damps
toward the active entry and blends toward the next, so the movement is
continuous even though the definition is discrete.

The rule that file enforces: **the artifact never occupies the reading column.**

### Chapters

`src/data/chapters.ts` is the spine. The order there must match the order of
sections in `src/routes/Home.tsx` — if they drift, the ground fades toward the
wrong colour and the nav readout lies.

## Content

All project content lives in `src/data/projects.ts`. Nothing is hardcoded in a
component.

**Nothing in the data files is invented.** Every project is real and links to
its own source. Where a number would be needed to make a claim — accuracy,
users, latency, throughput — and there is no verified figure on record, the
claim is not made and the field is omitted. There is deliberately no `metrics`
data anywhere.

The same rule governs the rest:

- `capabilities.ts` — every leaf traces to shipped work, except the `exploring`
  branch, which is labelled as reading rather than experience.
- `research.ts` — open questions from real projects, not a publication list.
- `lab.ts` — concept explorations, explicitly not products and not live
  inference. The cryptography scene computes real SHA-256 via `crypto.subtle`;
  the classical ciphers are educational and are labelled as such.

### Project images

`/public/images/*.png` are 512×512 black pictograms on transparency — marks,
not screenshots. `ProjectPlate.tsx` renders them as CSS masks filled with a
palette token, at their own proportions, so they read as figure plates rather
than pretending to be captures of a running system.

## Design system

Tokens live in `src/index.css`; Tailwind reads them and defines no colour of
its own.

| Role       | Value     |
|------------|-----------|
| Ground     | `#0B0D0C` |
| Surface    | `#171B18` |
| Text       | `#F1F0E8` |
| Secondary  | `#A7ADA7` |
| Muted      | `#7B827C` |
| Accent     | `#C8FF4D` |

Type: **Instrument Serif** for statements, **Geist** for everything read,
**Geist Mono** for machine facts only.

The lime accent marks state and importance — it is never a surface. The muted
token is lifted from the specified `#666D67` to `#7B827C` so it clears 4.5:1
against the darkest chapter ground; it carries real content at 11–13px.

## Accessibility

- `prefers-reduced-motion` removes camera movement, parallax, particle motion
  and the horizontal timeline, and skips SplitText entirely so text stays as
  plain markup.
- The custom cursor is not mounted on coarse pointers or under reduced motion,
  and the native cursor returns the moment the visitor presses Tab.
- All text roles clear WCAG AA against the page ground.

## Deployment

Vercel. `vercel.json` carries an SPA fallback so `/work/:slug` resolves on a
cold load; `/api/*` is excluded from it.
