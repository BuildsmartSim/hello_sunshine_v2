---
description: Automatically processes and imports new images to generate standard, portrait, and landscape sizes using sharp.
---

1. Place your unoptimized images into the `images/` directory at the project root.
2. Run the optimization pipeline script to convert them to multiple formats and sizes:

```bash
// turbo
node scripts/optimize-images.mjs
```

3. The script will output an optimized `.webp` and `.jpg` image for each size (standard, `-portrait`, and `-landscape`) into the `public/optimized/` folder structure, and automatically generate or update the `manifest.json` file referencing them.
