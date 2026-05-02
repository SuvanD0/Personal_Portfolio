---
name: Suvan Dommeti Portfolio
description: Personal portfolio for a builder who documents everything.
colors:
  toasted-linen: "#ECE7DA"
  ink-well: "#212121"
  ghost-white: "#FFFFFF"
  pearl-gray: "#EEEEEE"
  stone-mid: "#666666"
  clay-ember: "#B06B52"
  moss-shadow: "#1E1F1E"
  ash-light: "#EDEDED"
  charcoal-lift: "#333333"
  graphite-mid: "#404040"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: '"rlig" 1, "calt" 1'
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  2xl: "64px"
components:
  tag:
    backgroundColor: "{colors.pearl-gray}"
    textColor: "{colors.ink-well}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  tag-hover:
    backgroundColor: "#DCDCDC"
    textColor: "{colors.ink-well}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  role-card:
    backgroundColor: "transparent"
    textColor: "{colors.ink-well}"
    rounded: "{rounded.md}"
    padding: "16px"
  role-card-hover:
    backgroundColor: "rgba(0,0,0,0.04)"
    textColor: "{colors.ink-well}"
    rounded: "{rounded.md}"
    padding: "16px"
  accent-link:
    textColor: "{colors.clay-ember}"
    backgroundColor: "transparent"
    rounded: "{rounded.sm}"
    padding: "0"
  nav-link:
    textColor: "{colors.ink-well}"
    backgroundColor: "transparent"
    rounded: "{rounded.sm}"
    padding: "8px"
  nav-link-hover:
    textColor: "{colors.clay-ember}"
    backgroundColor: "transparent"
    rounded: "{rounded.sm}"
    padding: "8px"
---

# Design System: Suvan Dommeti Portfolio

## 1. Overview

**Creative North Star: "The Examined Life"**

This is a portfolio for a builder who tracks everything: what he listens to, how he sleeps, what he ships. The design follows the same discipline. Nothing is here to look good — everything is here because it carries information. The aesthetic is clean and restrained, referencing the precision of claude.ai and the substance-first personality of dvdrod.com.

The system runs in two modes. Light mode uses Toasted Linen — a warm, slightly amber cream that feels like a well-used notebook. Dark mode uses Moss Shadow — a dark green-gray that reads as deliberate and grounded, not default-dark. Clay Ember, a muted terracotta, appears in both modes as the single accent: interaction states, hover emphasis, the occasional inline link. It earns its presence by being rare.

The palette, typography, and component behavior reject every generic portfolio pattern: no hero with floating badges, no identical card grids, no gradient text. Personality comes through data and specificity — what Suvan tracks, builds, and cares about — not decorative flourish.

**Key Characteristics:**
- Dual-mode: Toasted Linen (light) / Moss Shadow (dark), each intentional
- Single natural accent: Clay Ember (#B06B52), used at ≤10% of any surface
- System sans throughout (SF Pro / Inter) — fast, familiar, never precious
- Max-w-3xl centered column; body text capped at 65–75ch
- Cards reveal; they don't stack decoratively
- Flat by default, lifted on interaction (paper-shadow pattern)

## 2. Colors: The Toasted Linen Palette

Two complete mode palettes unified by a single natural accent. Neither mode is the default — both are fully realized.

### Primary (Accent)
- **Clay Ember** (`#B06B52` / oklch(52% 0.09 35)): The only chromatic color in the system. Muted terracotta — earthy, warm, never loud. Used for interactive text links, hover states on nav items, and subtle data highlights. Appears in both modes. Light mode: on Toasted Linen. Dark mode: on Moss Shadow.

### Neutral — Light Mode
- **Toasted Linen** (`#ECE7DA`): Page background in light mode. Warm beige with amber undertones — reads as lived-in rather than sterile. Not pure white; the warmth is the point.
- **Ink Well** (`#212121`): Primary text and headings in light mode. Near-black with no blue cast.
- **Ghost White** (`#FFFFFF`): Card backgrounds when contrast against Toasted Linen is needed.
- **Pearl Gray** (`#EEEEEE`): Secondary surfaces, tag backgrounds, input fills, borders.
- **Stone Mid** (`#666666`): Muted foreground; captions, metadata, secondary labels.

### Neutral — Dark Mode
- **Moss Shadow** (`#1E1F1E`): Page background. Faint green-gray tint — not a default dark, a deliberate one. Chosen to echo the natural palette without forcing it.
- **Ash Light** (`#EDEDED`): Primary text in dark mode.
- **Charcoal Lift** (`#333333`): Card surfaces elevated above Moss Shadow.
- **Graphite Mid** (`#404040`): Secondary surfaces; input fills, borders, muted containers.

### Named Rules
**The One Ember Rule.** Clay Ember is used on ≤10% of any given surface, in both light and dark modes. Its rarity is exactly what makes it land. If you reach for it more than once per section, remove one instance.

**The No-Pure-White Rule.** Light mode backgrounds are never #FFFFFF at the page level. Toasted Linen is the canvas. Ghost White is reserved for cards that need to float above it.

## 3. Typography

**Display / Headline Font:** -apple-system, SF Pro Display, Inter (fallback sans)
**Body / Label Font:** -apple-system, SF Pro Text, Inter (fallback sans)

**Character:** System sans with ligatures on (`rlig`, `calt`). The single-family approach keeps the reading experience consistent and fast — no web font load, no flash of unstyled text. SF Pro Display at 600+ weight has enough character at large sizes; SF Pro Text at 400 is quiet and readable at small sizes.

### Hierarchy
- **Display** (700, clamp(1.75rem→2.5rem), lh 1.1, ls -0.02em): Section or page-level headings. Used sparingly — one per major section at most.
- **Headline** (600, 1.125rem, lh 1.3, ls -0.01em): Card titles, company names, role names. The primary mid-level signal.
- **Body** (400, 1rem, lh 1.6, ls normal): All prose. Capped at 65–75ch per line. Comfortable reading, no compression.
- **Label** (500, 0.75rem, lh 1.4, ls +0.01em): Tags, metadata, captions, secondary annotations. Slight positive tracking to compensate for small size.

### Named Rules
**The System-First Rule.** No web font imports. The system stack renders instantly and the portfolio's content — not the typography — is the differentiator. If a heading needs to feel more distinctive, achieve it through weight and size contrast, not a different typeface.

**The Tight-Top Rule.** Headings use negative letter-spacing (−0.01 to −0.02em). At display size, default tracking reads as too loose. Tighten it.

## 4. Elevation

This system is flat by default. Surfaces rest on the page; depth appears only as a response to interaction.

The `paper-shadow` class is the one exception: it applies a layered ambient shadow (1px + 2px, low opacity) at rest, then lifts dramatically on hover (`28px` blur, higher opacity). This pattern is reserved for interactive card elements — TiltedCard and similar — where the lift is a response to user attention, not decoration.

Nav items, role cards, and tags use background tint for hover state (rgba(0,0,0,0.04) in light mode), never a shadow.

### Shadow Vocabulary
- **Ambient resting** (`0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`): Light resting elevation for interactive card elements. Barely visible at rest.
- **Hover lift** (`0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)`): Full elevation on hover. Significant — signals that this element responds to touch.

### Named Rules
**The Flat-By-Default Rule.** Surfaces don't have shadows at rest unless they are explicitly interactive and use the paper-shadow pattern. Role cards, stat panels, and section containers are shadow-free.

## 5. Components

### Role Card (Expandable Entry)
The primary content unit. Used for work experience and projects. Flat background, no border at rest. Expands on click using a CSS max-height + opacity transition.

- **Shape:** Gently curved (8px / rounded-lg)
- **Rest:** Transparent background; foreground text at full opacity
- **Hover:** Background tint rgba(0,0,0,0.04) in light mode; no shadow
- **Expanded state:** Revealed content fades in at 300ms ease-out; chevron rotates 180°
- **Tags (inside):** Pearl Gray background, 4px radius, 0.75rem label type; hover shifts to #DCDCDC

### Tags / Chips
Inline categorical labels for skills, technologies, and data annotations.

- **Shape:** Very slightly rounded (4px / rounded-sm)
- **Light mode:** Pearl Gray bg (#EEEEEE), Ink Well text
- **Dark mode:** Graphite Mid bg (#404040), Ash Light text
- **Hover:** Background darkens one step; no border added

### Navigation Header
Centered at max-w-3xl. Name on the left at headline weight; icon links + theme toggle on the right.

- **Name link:** Headline weight (600), full Ink Well / Ash Light; opacity 0.8 on hover
- **Icon links:** 16×16px Lucide icons; Ink Well / Ash Light; opacity 0.7 default, 1.0 on hover
- **Active accent:** Clay Ember (`#B06B52`) on nav link hover text (used sparingly, not on the name)
- **Theme toggle:** Animated rotation (90° at 500ms ease-in-out)

### Tilted Card (Gallery / Feature)
3D-tilt on hover. Reserved for the Fun page and gallery contexts.

- **Shape:** Rounded-md (8px)
- **Elevation:** paper-shadow at rest; hover-lift on interaction (see Elevation)
- **Tilt:** CSS transform perspective, subtle (not exceeding ±10°)
- **Use:** Only where the tilt adds contextual delight — not as default card treatment

### Stat / Data Panel (Planned — Stats Page)
For the stats page and Whoop data surface. Display-level numbers with label beneath.

- **Number:** Display scale (clamp 1.75–2.5rem), weight 700, Ink Well / Ash Light
- **Label:** Label scale (0.75rem), weight 500, Stone Mid / Graphite Mid
- **Layout:** Inline flow or grid; never identical-card-grid pattern
- **Accent use:** Clay Ember on the single most important metric per group, used once

## 6. Do's and Don'ts

### Do:
- **Do** use Toasted Linen (`#ECE7DA`) as the light mode page background — never pure white at the page level.
- **Do** cap Clay Ember at ≤10% of any surface. One use per section maximum.
- **Do** use system font stack throughout. No web font imports.
- **Do** tighten heading letter-spacing: −0.01em at headline size, −0.02em at display size.
- **Do** cap body text at 65–75ch per line. Set max-w-3xl (768px) or narrower.
- **Do** keep cards flat at rest; reveal depth (paper-shadow lift) only on interaction.
- **Do** use specificity in copy: exact numbers, actual data, real names. Vague adjectives about Suvan are prohibited.
- **Do** ensure both light and dark modes receive equal design attention — neither is a fallback.

### Don't:
- **Don't** use gradient text (`background-clip: text` + gradient). Prohibited.
- **Don't** build a hero section with a tagline, floating badges, and a CTA button. That is exactly what this portfolio is not.
- **Don't** create identical card grids: same-sized cards, same icon + heading + text structure repeated. Use varied entry formats.
- **Don't** use `border-left` greater than 1px as a colored stripe on cards, callouts, or list items. Rewrite with full borders or background tints.
- **Don't** use glassmorphism (backdrop-filter blur + semi-transparent panel) decoratively. If blur appears, it must be load-bearing.
- **Don't** add a second accent color. Clay Ember is the only chromatic value in the system.
- **Don't** display health data, stats, or Spotify data with the hero-metric template (big number, gradient card, supporting stat row). That is a SaaS dashboard cliché. Find a form that fits the content.
- **Don't** use bounce or elastic easing. Ease-out-quart or cubic-bezier(0.4, 0, 0.2, 1) for state changes; ease-in-out for longer sequences.
