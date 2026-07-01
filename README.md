<div align="center">

# Suvan Dommeti — Personal Site

A living portfolio: work, projects, and a few honest signals about how I actually spend my time.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## Overview

A portfolio of my work and projects, plus a few live data feeds — WHOOP recovery/fitness and current Spotify track — wired in for fun.

## Highlights

- **Live WHOOP data** — recovery, strain, and fitness pulled from the WHOOP API, animated on load
- **Now playing** — Spotify integration showing the track currently (or last) playing
- **Origami & music** — the non-code things I keep coming back to
- **Light / dark theming** — hand-tuned warm-linen and moss-shadow palettes with a smooth, flash-free toggle
- **Design system** — a dedicated `/styleguide` route documenting the colors, type, and components
- **Playful details** — motion, tilt cards, and a few easter eggs

## Design System

| | Token | Light | Dark |
|---|---|---|---|
| 🟢 | **Primary** — Sage Moss | `#5E915C` | `#75A872` |
| ⬜ | **Secondary** — Pearl Gray | `#EEEEEE` | `#404040` |
| 🟣 | **Tertiary** — Mauve (accents) | `#B96E89` | — |
| ⬛ | **Neutral** — Ink | `#212121` | `#EDEDED` |

**Type** — [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) for headlines · [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) for body & labels.

See it all live at `/styleguide`.

## Tech Stack

- **Framework** — React 18 + TypeScript, bundled with Vite
- **Styling** — Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (Radix primitives)
- **Motion** — Framer Motion, GSAP, anime.js
- **Data** — TanStack Query, with serverless API routes for WHOOP OAuth + data
- **Charts** — Recharts + custom sparklines
- **Deploy** — Vercel (with Web Analytics)

## Getting Started

```bash
# install
npm install

# run the dev server (http://localhost:8080)
npm run dev

# type-check + production build
npm run build

# preview the production build
npm run preview
```

WHOOP and Spotify integrations expect credentials in `.env.local` — see `.env.local` for the required keys.

## Project Structure

```
src/
├─ pages/          # routed views (Home, Whoop, Stats, Resume, Origami, StyleGuide…)
├─ components/
│  ├─ ui/          # shadcn primitives
│  ├─ common/      # shared building blocks (SectionTitle, ThemeSlider, IconLink…)
│  ├─ custom/      # bespoke pieces (RoleCard, TiltedCard, DomeGallery…)
│  └─ whoop/       # WHOOP-specific widgets (CountUp, Sparkline)
├─ hooks/          # data + theme hooks
├─ services/       # WHOOP / Spotify clients
└─ data/           # portfolio content
api/                # serverless routes (WHOOP OAuth + data)
```

---

<div align="center">
<sub>Built by Suvan Dommeti · deployed on Vercel</sub>
</div>
