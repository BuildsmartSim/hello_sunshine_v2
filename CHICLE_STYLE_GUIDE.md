# Chicle Aesthetic Style Guide

This document captures the approved display logic for the "Hello Sunshine" Chicle font aesthetic. These configurations use premium pencil hatching textures provided by the user.

## Preferred Combinations

| ID | Application | Texture | Background | Stroke | Note |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **7002_CANV** | Hero / Main Headers | Yellow (Bold) | Canvas Paper | `1.5px #1F1A17` | High contrast, vibrant sunshine vibe. |
| **7002_CEDR** | Dark Mode Hero | Yellow (Bold) | Deep Cedar | `1px #F3EFE6` | Glowing sunshine on wood. |
| **7004_CEDR** | Footer / Subtle Accents | Cream (Standard) | Deep Cedar | `0.8px rgba(0,0,0,0.6)`| Elegant "chalk-written" editorial feel. |
| **8022**       | Preferred Dark Accent | Cream (Standard) | Deep Cedar | `1px #F3EFE6` | The current favorite for editorial wood accents. |
| **11021**      | Atmospheric Graphite | Pencil Grey (Ex. Soft) | Natural Paper | `1px #1F1A17` | Very delicate, authentic hand-drawn feel. |
| **12001**      | Soft Sunshine Paper | Yellow (Standard) | Natural Paper | `1.2px #1F1A17` | Clean, editorial hand-drawn yellow. |
| **26000**      | The Organic Champion | Yellow/Cream | Natural Paper | `1.2px #1F1A17` | **CHOSEN PAIRING**: Chicle Headers + Caveat Hand-written Body. |
| **32003**      | Hero Layout Champion | Yellow (Bold) | Natural Paper | `1.5px #1F1A17` | **CHOSEN HERO**: 1.5° tilted photo + Bottom-left polaroid overlap. |
| **36003**      | Shadow Tone Champion | Smoked Wood   | Natural Paper | `n/a`           | **CHOSEN SHADOW**: `#322B28` (Smoked Wood) with tight contact. |
| **37001**      | Photo Style Champion | White Border  | Natural Paper | `n/a`           | **CHOSEN PHOTO**: 12px White Border + 4px Rounded Corners. |

---

## Technical Implementation

### CSS Utilities (`globals.css`)
- `.hatch-aesthetic-yellow-bold`: Uses `/textures/aesthetic-hatch-bold-yellow.png`
- `.hatch-aesthetic-cream`: Uses `/textures/aesthetic-hatch-cream.png`
- `.pencil-blend-multiply`: `mix-blend-mode: multiply` (Best for light paper)
- `.pencil-blend-screen`: `mix-blend-mode: screen` (Best for dark wood)
- `.pencil-blend-overlay`: `mix-blend-mode: overlay` (General organic blend)

### Component Logic
To apply these styles, use the following pattern:
```jsx
<h1 className="hatch-aesthetic-yellow-bold pencil-blend-multiply" 
    style={{ WebkitTextStroke: '1.5px #1F1A17' }}>
  Hello Sunshine
</h1>
```

---
*Last Updated: 2026-02-12*
