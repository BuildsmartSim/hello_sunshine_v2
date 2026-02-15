---
description: How to optimize images for the web app
---

# Image Optimization Workflow

When new images are added to the repository, they need to be optimized before use in the app.

## Adding New Images

// turbo-all

1. Drop new images into the `images/` folder:
   - `images/Phtographs_Printed/` for landscape/portrait photographs
   - `images/square_polaroids/` for square polaroid-style images
   - Or create a new subfolder for other categories

2. Run the optimization pipeline:
```bash
npm run optimize
```

3. The script will:
   - Resize images to max 1920px (preserving aspect ratio)
   - Generate WebP (primary) + JPEG (fallback) versions
   - Output to `public/optimized/` with clean kebab-case filenames
   - Generate `public/optimized/manifest.json` mapping all images

4. Reference optimized images in components using the `/optimized/` path:
```tsx
<img src="/optimized/photographs/my-image.webp" alt="..." />
```

## Optimizing Existing Public Images

If large images are added directly to `public/`, compress them in-place:

```bash
npm run optimize:public
```

This scans `public/` for images over 500 KB and compresses them while keeping the same filename.

## Force Re-Processing

To re-process all images (ignoring the cache):

```bash
npm run optimize:force
```

## Key Rules for Agents

- **NEVER** place raw camera photos (>1 MB) directly into `public/`
- **ALWAYS** run `npm run optimize` after adding new source images
- Reference images from `public/optimized/` in components, not from `images/`
- The manifest at `public/optimized/manifest.json` maps original filenames to optimized paths
