# Hello Sunshine — Design System

> **This is the human-readable companion to `src/design-system/tokens.ts`.**
> All values here are codified in that file. Import from `@/design-system/tokens` — never hard-code.

---

## 1. Colour Palette

| Token | Hex | Role |
|---|---|---|
| `primary` | `#F8C630` | Sun-faded yellow |
| `primaryBright` | `#f9cb40` | Buttons, accents |
| `secondary` | `#D4A32A` | Darker ochre |
| `charcoal` | `#2C2C2C` | Primary text |
| `charcoalDeep` | `#1F1A17` | Darkest ink / strokes |
| `smokedWood` | `#322B28` | Shadow tone (Champion ID 36003) |
| `bgLight` | `#F3EFE6` | Natural Paper background |
| `bgPageBase` | `#FDFCF9` | Page body |
| `woodDark` | `#3E2723` | Deep cedar |

---

## 2. Typography Hierarchy

| Role | Font | Var |
|---|---|---|
| **H1 / H2 / H3** | ChicleForce | `--font-chicle` |
| **Subtitle / Annotation** | Caveat | `--font-caveat` |
| **Body** | DM Sans | `--font-dm-sans` |
| **Display italic** | Playfair Display | `--font-playfair` |

> [!CAUTION]
> Do NOT mix fonts outside these roles. Chicle is ONLY for headers. Caveat is ONLY for handwritten annotations.

---

## 3. Pencil & Hatch System

**Hatch classes** (defined in `globals.css`):
- `hatch-aesthetic-yellow-bold` — Hero headers on light paper
- `hatch-aesthetic-cream` — Headers on dark cedar
- `hatch-pencil-grey` — Atmospheric graphite

**Blend modes**:
- Light backgrounds → `pencil-blend-multiply`
- Dark backgrounds → `pencil-blend-screen`

**Stroke presets** (via `WebkitTextStroke`):
- Hero: `1.5px #1F1A17`
- Standard: `1.2px #1F1A17`
- Light-on-dark: `1px #F3EFE6`

---

## 4. Shadows (Champion ID 36003)

| Name | Value | Use |
|---|---|---|
| `photo` | `0 15px 30px -5px rgba(50,43,40,0.45)` | Landscape photos |
| `polaroid` | `0 4px 6px -1px rgba(50,43,40,0.65)` | Polaroid frames |
| `section` | `0 50px 100px -20px rgba(0,0,0,0.1)` | Elevated sections |

> [!IMPORTANT]
> Always use the **Smoked Wood** tone `rgba(50,43,40,…)` — never pure black shadows.

---

## 5. Photo Styling (Champion ID 37001)

- **Border**: 12px white, 4px rounded corners
- **Tilt**: `rotate(1.5deg)`
- **Shadow**: Smoked Wood (see above)

---

## 6. Polaroid Component

Three locked-in aging variants with deterministic randomiser:

| Variant | Frame | Vignette | Emboss | Grain |
|---|---|---|---|---|
| **A · Soft Warmth** | `#faf8f4` | 25% @ 55% | 1px micro | 6% |
| **B · Sun-Faded Shelf** | `#f5f0e8` | 40% @ 45% | 1.5px | 12% + stain |
| **C · Bleached & Embossed** | `#f0ebe0` | 50% @ 35% | 2px ridge | 18% + stain |

```tsx
import { Polaroid } from '@/components/Polaroid';

// Auto-randomised from label
<Polaroid src="/photo.jpg" label="Cedar Warmth" />

// Explicit variant
<Polaroid src="/photo.jpg" label="Cedar Warmth" variant="B" />
```

---

## 7. Layout Grid (Champion Hero ID 47002)

- **Photo**: col-span-9
- **Text**: col-span-3 with 32px ledger gap
- **Header stack**: -12px tight vertical interlock
- **Page padding**: 96px (`p-24`)
- **Section radius**: 120px

---

## 8. Icons (Hand-Drawn)

All in `/public/icons/`. Use the `icons` export from tokens:

`sauna` · `hotTub` · `plungePool` · `firePit` · `shower` · `towels` · `home` · `heart` · `calendar` · `location` · `phone` · `mail` · `burger` · `instagram` · `facebook`

---

## 9. Logo

- Primary: `/logo-black-yellow.png`
- Yellow badge with black charcoal sun face + "HELLO SUNSHINE SAUNA"

---

*Last updated: 2026-02-13*
