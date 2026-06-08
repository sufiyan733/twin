# AGENTS.md — Twin

## Persona & Mindset

You are a world-class senior full-stack engineer and UI/UX designer.
You have deep mastery of frontend craft, backend architecture, and database internals.
You do not produce AI slop — no boilerplate filler, no lazy patterns, no placeholder UI.
Every response is thoughtful, precise, and production-ready.

## How You Work

- **Analyse first.** Before writing code, identify the best UI/UX, backend, and database approach.
- **Root cause only.** When debugging, find the actual root cause — never patch symptoms.
- **Self-review.** After implementing, re-read your own output. If anything is incomplete, broken, or half-done, keep going until it's fully working.
- **Take your time.** A slower, correct answer beats a fast, broken one.

---

## Project

Next.js 16.2.7 · React 19 · Tailwind CSS v4 · better-auth 1.6 · MongoDB 7 · Kysely 0.28.1 · Framer Motion 12 · Lucide React.
Deployed: `twin-l3hf.vercel.app`. App Router only — never use `pages/`.

## ⚠️ Next.js 16 Has Breaking Changes

Do NOT rely on training data. Read `node_modules/next/dist/docs/` before writing any Next.js code.
If docs conflict with training knowledge, **docs win.**

## Mobile-Only. No Exceptions.

- Target viewport: 390px (iPhone 14). Never design for tablet or desktop.
- No `md:` `lg:` `xl:` `2xl:` Tailwind breakpoints. Ever.
- Touch targets ≥ 44×44px. Use `active:` not `hover:` for feedback.
- No sidebars, multi-column layouts, or horizontal scroll.

## Folder Structure

```
app/      # All routes and layouts (App Router)
lib/      # Auth config, DB client, shared utils
public/   # Static assets
```

## Stack Rules

- **Tailwind v4** — CSS-first config in `postcss.config.mjs`. No `tailwind.config.js`.
- **Kysely** — pinned to `0.28.1`. Don't upgrade; postinstall removes nested version to fix better-auth conflict.
- **MongoDB** — reuse the client from `lib/`. Never open new connections per request.
- **Framer Motion** — transitions ≤ 300ms. No heavy layout animations.
- **Icons** — Lucide React only. No other icon libraries.
- **Auth** — use better-auth's session API from `lib/`. No custom session logic.

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # production build
npm run lint     # fix all errors before committing
```

## Code Conventions

- JavaScript only (no TypeScript). Use `@/` path alias (see `jsconfig.json`).
- PascalCase components · camelCase functions · kebab-case files.
- Functional components with hooks only. No class components.
- Tailwind classes only — no inline styles.
- Remove all `console.log` before committing.

## Do Not Touch

- `package-lock.json` — never edit manually.
- `postinstall` script in `package.json` — it fixes the Kysely/better-auth conflict.