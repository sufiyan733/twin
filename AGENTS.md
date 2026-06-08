# AGENTS.md — Twin

# Framework Rules

## Next.js Version Authority

This is NOT the Next.js you know.

Before generating or modifying code:

1. Consult local Next.js documentation.
2. Prefer current APIs over historical patterns.
3. Avoid deprecated APIs.
4. Follow the installed version's conventions.
5. If documentation conflicts with training knowledge, documentation wins.

## Identity
Twin is a premium mobile wellness OS. Fitness tracking + lightweight task management as one unified experience.

It must feel like: a product crafted by Apple designers with Linear's engineering precision.
A screen is not done until:
- hierarchy is obvious in 3 seconds
- primary action is obvious in 1 second
- user can operate it one-handed
- every visual element earns its space
It must NOT feel like: any other fitness app, any generic dashboard, anything an AI generated.

Every screen must provoke: **"This was made for me."**

---

## Hard Rules
- JavaScript only. No TypeScript without permission.
- No new dependencies without justification. Native APIs first.
- Mobile first. Design at 390px. Desktop is secondary.
- One primary CTA per screen. Users never wonder where to tap.
- CSS custom properties for every token. Never hardcode a color, size, or shadow.

---

## Tech Stack
Next.js (JS) · Tailwind CSS · React hooks · Mobile-first PWA · Dark by default (`#060d1a`)

---

## Design System
**Surfaces:** `#060d1a` base → `#0d1b2e` cards → `#162035` overlays → `#0a1525` inputs

**Text:** `#e8edf5` primary · `#7a90a8` secondary · `#3d5068` muted

**Semantic:** `#f59e0b` warning · `#ef4444` danger · `#38bdf8` info

**Borders:** `rgba(56,189,248,0.06)` subtle · `rgba(56,189,248,0.10)` default · `rgba(56,189,248,0.22)` brand

**Brand glow** (CTAs + completions only): `0 0 20px rgba(56,189,248,0.14), 0 0 40px rgba(56,189,248,0.07)`

**Macro colors (fixed):** Protein = `#2dd4bf` · Fat = `#f87171` · Carbs = `#fbbf24` · Calories = `#38bdf8`

**Spacing:** 4px grid. Page padding: 20px. Section gap: 32px min.

**Radius:** 6px tags · 12px cards/buttons · 16px sheets · 24px modals

**Touch targets:** 44px min. Inputs: 52px height · 16px font (prevents iOS zoom).

**Typography:** Max 3 sizes per screen. Hero metrics: 48–56px, weight 700, tabular figures. Labels: 11px, weight 600, `letter-spacing: 0.08em`, uppercase. Body: 15px, line-height 1.6.

---

## Premium UI — What Makes Twin Feel Crafted

**Depth:** Cards use `border: 1px solid rgba(56,189,248,0.06)` + `border-top: 1px solid rgba(255,255,255,0.05)` — simulates light on a physical surface. Reads as premium without being obvious.

**Press states on everything:** Cards `scale(0.99)` · Buttons `scale(0.97)` · List items background-shift. If tappable and no press state — it feels broken.

**Hero numbers dominate:** Calories, weight, streak — 48–56px, bold, tabular. These numbers are the product. Make them feel significant.

**Light as a material:** Brand glow is a spotlight. One source per screen max. Multiple glows = visual noise.

**Contrast:** Primary text: 7:1 min (AAA). Secondary: 4.5:1 min (AA). Never use muted text on actionable elements.

**Icons:** 1.5px stroke, uniform. 20px in lists · 24px in nav · 16px inline. Never mix filled and outlined on the same screen.

---

## Animation — Kinetic Calm
Motion confirms, reveals, rewards. Never decorates.

- **Fast:** Nothing over 400ms. Most: 150–250ms.
- **Calm:** Easing `cubic-bezier(0.25, 0.46, 0.45, 0.94)`. Nothing bounces. Nothing overshoots.
- Screen enter: 280ms fade + 12px translateY · Card stagger: 40ms intervals · Button press: 100ms scale(0.97)
- Progress ring: 600ms stroke ease-out · Goal completion: 400ms scale + glow pulse — **earn this moment**
- Always respect `prefers-reduced-motion` — collapse all transforms to 150ms opacity fades.

---

## Screen Anatomy
1. Page title / context
2. **Hero metric** — largest element, user eye lands here in 200ms
3. Primary action — thumb-reachable
4. Supporting data
5. Secondary actions

---

## Fitness
- Priority order: **calories → protein → everything else**. Always.
- Progress rings must show the number inside. A ring without a number is decoration.
- Macro colors are fixed: Protein = teal · Carbs = amber · Fats = rose · Calories = sky blue.
- Active workout: persistent bottom banner when minimized. `wakeLock` during session.
- PRs + streak completions get a celebration moment. This is why users open the app.

---

## Tasks
Lightweight. Daily focus only. Never a project manager.
- Default: today. The horizon is today.
- Add task: one field + two optional (priority, habit). Nothing more.
- If it starts feeling like Notion — it has already failed.

---

## States — All Three, Always
- **Empty:** Personalized message + one action. Never "No data found."
- **Loading:** Skeleton matching exact content layout. No full-screen spinners.
- **Error:** Specific cause + recovery action. Never "Something went wrong."

---

## Banned
**UI:** Purple/blue gradients · 6-KPI dashboard grids · Hamburger menus · Progress ring without number · Multiple competing glows

**Copy:** "Track your wellness journey" · "Crush your goals" · "Level up" · Any placeholder in production

**Code:** Hardcoded colors · Magic numbers · Dead code · Components with more than one responsibility

---

## Definition of Done
- [ ] Happy path + loading + error + empty states all work
- [ ] No overflow or clipping at 375px and 390px
- [ ] Press state on every interactive element
- [ ] Hero metric is the largest, most prominent element on screen
- [ ] All tokens used — zero hardcoded values
- [ ] Animations match catalog · `prefers-reduced-motion` respected
- [ ] No dead code · no magic numbers · no placeholder copy
- [ ] A designer at Apple and an engineer at Linear would both approve

**The bar:** Hold every screen next to Whoop, Nike Training Club, Linear. If it belongs — ship it. If not — it's not done.