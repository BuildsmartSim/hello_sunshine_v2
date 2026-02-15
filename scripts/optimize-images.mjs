#!/usr/bin/env node

/**
 * Image Optimization Pipeline for Hello Sunshine v2
 * 
 * Usage:
 *   node scripts/optimize-images.mjs              # Process images/ → public/optimized/
 *   node scripts/optimize-images.mjs --in-place   # Compress oversized files in public/ directly
 *   node scripts/optimize-images.mjs --force       # Re-process all files (ignore cache)
 * 
 * Supports: .jpg, .jpeg, .png, .webp, .jfif, .heic
 */

import sharp from 'sharp';
import { readdir, stat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, basename, extname, relative, dirname } from 'node:path';
import { existsSync } from 'node:fs';

// ─── Configuration ──────────────────────────────────────────────────────────────
const CONFIG = {
    // Source & output directories
    sourceDir: 'images',
    outputDir: 'public/optimized',
    publicDir: 'public',

    // Resize constraints
    maxWidth: 1920,
    maxHeight: 1920,

    // Quality settings
    webpQuality: 80,
    jpegQuality: 82,

    // Supported input formats
    supportedExtensions: new Set(['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.heic']),

    // In-place mode: max file size before optimization triggers (bytes)
    inPlaceSizeThreshold: 500 * 1024, // 500 KB

    // Cache file location
    cacheFile: 'scripts/.optimize-cache.json',

    // Public files to always optimize in --in-place mode (known offenders)
    publicTargets: [
        'DSCF2335.JPG',
        'P1130170.JPG',
        'paper_buttons.png',
        'canvas-background.png',
    ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function toKebabCase(filename) {
    const name = filename
        .replace(/[^a-zA-Z0-9._-]/g, '-')  // Replace spaces/special chars with hyphens
        .replace(/--+/g, '-')               // Collapse multiple hyphens
        .replace(/^-|-$/g, '')              // Trim leading/trailing hyphens
        .toLowerCase();
    return name;
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function percentSaved(original, optimized) {
    return ((1 - optimized / original) * 100).toFixed(1);
}

async function loadCache(forceFresh) {
    if (forceFresh) return {};
    try {
        const data = await readFile(CONFIG.cacheFile, 'utf-8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveCache(cache) {
    const dir = dirname(CONFIG.cacheFile);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(CONFIG.cacheFile, JSON.stringify(cache, null, 2));
}

async function getFilesRecursive(dir, files = []) {
    if (!existsSync(dir)) return files;
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            await getFilesRecursive(fullPath, files);
        } else {
            const ext = extname(entry.name).toLowerCase();
            if (CONFIG.supportedExtensions.has(ext)) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

function mapSubfolder(relativePath) {
    const rel = relativePath.toLowerCase();
    if (rel.includes('phtograph') || rel.includes('photograph') || rel.includes('printed')) {
        return 'photographs';
    }
    if (rel.includes('polaroid') || rel.includes('square')) {
        return 'polaroids';
    }
    return 'misc';
}

// ─── Core Processing ────────────────────────────────────────────────────────────

async function optimizeImage(inputPath, outputDir, originalName) {
    const stats = await stat(inputPath);
    const originalSize = stats.size;

    const nameWithoutExt = basename(originalName, extname(originalName));
    const cleanName = toKebabCase(nameWithoutExt);

    const webpPath = join(outputDir, `${cleanName}.webp`);
    const jpegPath = join(outputDir, `${cleanName}.jpg`);

    await mkdir(outputDir, { recursive: true });

    // Load and resize
    let pipeline = sharp(inputPath, { failOn: 'none' })
        .rotate() // Auto-rotate based on EXIF
        .resize({
            width: CONFIG.maxWidth,
            height: CONFIG.maxHeight,
            fit: 'inside',
            withoutEnlargement: true,
        });

    // Output WebP
    const webpBuffer = await pipeline.clone().webp({ quality: CONFIG.webpQuality }).toBuffer();
    await writeFile(webpPath, webpBuffer);

    // Output JPEG
    const jpegBuffer = await pipeline.clone().jpeg({ quality: CONFIG.jpegQuality, mozjpeg: true }).toBuffer();
    await writeFile(jpegPath, jpegBuffer);

    return {
        original: originalName,
        originalSize,
        webpPath,
        webpSize: webpBuffer.length,
        jpegPath,
        jpegSize: jpegBuffer.length,
    };
}

async function optimizeInPlace(filePath) {
    const stats = await stat(filePath);
    const originalSize = stats.size;
    const ext = extname(filePath).toLowerCase();

    // Read file into buffer first to avoid Windows file lock issues
    // (sharp holds a read lock that prevents writing to the same file)
    const inputBuffer = await readFile(filePath);

    let pipeline = sharp(inputBuffer, { failOn: 'none' })
        .rotate()
        .resize({
            width: CONFIG.maxWidth,
            height: CONFIG.maxHeight,
            fit: 'inside',
            withoutEnlargement: true,
        });

    let buffer;
    if (ext === '.png') {
        buffer = await pipeline.png({ quality: 80, compressionLevel: 9 }).toBuffer();
    } else {
        // JPG/JPEG/JFIF → JPEG
        buffer = await pipeline.jpeg({ quality: CONFIG.jpegQuality, mozjpeg: true }).toBuffer();
    }

    await writeFile(filePath, buffer);

    return {
        file: relative('.', filePath),
        originalSize,
        newSize: buffer.length,
    };
}

// ─── Pipeline Modes ─────────────────────────────────────────────────────────────

async function runFullPipeline(forceAll) {
    console.log('\n🌞 Hello Sunshine — Image Optimization Pipeline\n');
    console.log(`   Source:  ${CONFIG.sourceDir}/`);
    console.log(`   Output:  ${CONFIG.outputDir}/\n`);

    const files = await getFilesRecursive(CONFIG.sourceDir);
    if (files.length === 0) {
        console.log('   ⚠️  No images found in source directory.\n');
        return;
    }

    console.log(`   Found ${files.length} source images.\n`);

    const cache = await loadCache(forceAll);
    const manifest = {};
    const results = [];
    let skipped = 0;

    for (const filePath of files) {
        const relPath = relative(CONFIG.sourceDir, filePath);
        const fileStats = await stat(filePath);
        const cacheKey = relPath;
        const mtimeMs = fileStats.mtimeMs;

        // Skip if cached and unchanged
        if (cache[cacheKey] && cache[cacheKey].mtimeMs === mtimeMs) {
            skipped++;
            // Still include in manifest from cache
            if (cache[cacheKey].manifest) {
                Object.assign(manifest, cache[cacheKey].manifest);
            }
            continue;
        }

        const subfolder = mapSubfolder(relPath);
        const outputSubDir = join(CONFIG.outputDir, subfolder);

        try {
            process.stdout.write(`   ⏳ ${basename(filePath)}...`);
            const result = await optimizeImage(filePath, outputSubDir, basename(filePath));
            results.push(result);

            const manifestEntry = {};
            manifestEntry[result.original] = {
                webp: '/' + result.webpPath.replace(/\\/g, '/').replace('public/', ''),
                jpeg: '/' + result.jpegPath.replace(/\\/g, '/').replace('public/', ''),
            };
            Object.assign(manifest, manifestEntry);

            cache[cacheKey] = { mtimeMs, manifest: manifestEntry };

            console.log(` ✅ ${formatBytes(result.originalSize)} → WebP: ${formatBytes(result.webpSize)} (${percentSaved(result.originalSize, result.webpSize)}% saved)`);
        } catch (err) {
            console.log(` ❌ Error: ${err.message}`);
        }
    }

    // Save cache and manifest
    await saveCache(cache);
    await mkdir(CONFIG.outputDir, { recursive: true });
    await writeFile(
        join(CONFIG.outputDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    // Summary
    console.log('\n' + '─'.repeat(60));
    console.log(`   ✅ Processed: ${results.length}`);
    console.log(`   ⏭️  Skipped (unchanged): ${skipped}`);
    if (results.length > 0) {
        const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0);
        const totalWebp = results.reduce((s, r) => s + r.webpSize, 0);
        console.log(`   📊 Total: ${formatBytes(totalOriginal)} → ${formatBytes(totalWebp)} (${percentSaved(totalOriginal, totalWebp)}% saved)`);
    }
    console.log(`   📋 Manifest: ${CONFIG.outputDir}/manifest.json`);
    console.log('');
}

async function runInPlace() {
    console.log('\n🌞 Hello Sunshine — In-Place Public Image Optimization\n');

    const results = [];

    // First: process known large offenders
    for (const filename of CONFIG.publicTargets) {
        const filePath = join(CONFIG.publicDir, filename);
        if (!existsSync(filePath)) {
            console.log(`   ⚠️  ${filename} not found, skipping.`);
            continue;
        }

        const stats = await stat(filePath);
        if (stats.size <= CONFIG.inPlaceSizeThreshold) {
            console.log(`   ⏭️  ${filename} already small (${formatBytes(stats.size)}), skipping.`);
            continue;
        }

        try {
            process.stdout.write(`   ⏳ ${filename}...`);
            const result = await optimizeInPlace(filePath);
            results.push(result);
            console.log(` ✅ ${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)} (${percentSaved(result.originalSize, result.newSize)}% saved)`);
        } catch (err) {
            console.log(` ❌ Error: ${err.message}`);
        }
    }

    // Then: scan for any other oversized images in public/
    const allPublicImages = await getFilesRecursive(CONFIG.publicDir);
    for (const filePath of allPublicImages) {
        const rel = relative(CONFIG.publicDir, filePath);
        // Skip files already in optimized/ output, textures, and icons (small by design)
        if (rel.startsWith('optimized') || rel.startsWith('textures') || rel.startsWith('icons') || rel.startsWith('fonts')) continue;
        // Skip already-processed targets
        if (CONFIG.publicTargets.includes(basename(filePath))) continue;

        const stats = await stat(filePath);
        if (stats.size > CONFIG.inPlaceSizeThreshold) {
            try {
                process.stdout.write(`   ⏳ ${rel}...`);
                const result = await optimizeInPlace(filePath);
                results.push(result);
                console.log(` ✅ ${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)} (${percentSaved(result.originalSize, result.newSize)}% saved)`);
            } catch (err) {
                console.log(` ❌ Error: ${err.message}`);
            }
        }
    }

    // Summary
    console.log('\n' + '─'.repeat(60));
    if (results.length === 0) {
        console.log('   ✅ All public images are already optimized!\n');
    } else {
        const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0);
        const totalNew = results.reduce((s, r) => s + r.newSize, 0);
        console.log(`   ✅ Optimized: ${results.length} files`);
        console.log(`   📊 Total: ${formatBytes(totalOriginal)} → ${formatBytes(totalNew)} (${percentSaved(totalOriginal, totalNew)}% saved)`);
        console.log('');
    }
}

// ─── CLI ────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const inPlace = args.includes('--in-place');
const force = args.includes('--force');

if (inPlace) {
    runInPlace().catch(console.error);
} else {
    runFullPipeline(force).catch(console.error);
}
