'use server';

import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { requireAdmin } from '@/lib/auth';

const execFileAsync = promisify(execFile);

export async function renamePhoto(originalName: string, newNameWithoutExt: string) {
    const auth = await requireAdmin();
    if (!auth.authorized) throw new Error('Admin access required');

    if (typeof originalName !== 'string' || originalName !== path.basename(originalName) ||
        /[\\/\0]/.test(originalName) || typeof newNameWithoutExt !== 'string' ||
        !/^[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?$/.test(newNameWithoutExt)) {
        throw new Error('Invalid photo name');
    }
    const ext = path.extname(originalName).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) throw new Error('Unsupported photo type');

    const rootDir = process.cwd();
    const manifestPath = path.join(rootDir, 'public', 'optimized', 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    if (!Object.hasOwn(manifest, originalName)) throw new Error('Photo not found in manifest');
    const entry = manifest[originalName];
    const subfolder = entry.webp.includes('/polaroids/') ? 'polaroids' : 'photographs';
    const imagesDir = await fs.realpath(path.join(rootDir, 'images', subfolder));
    const source = path.join(imagesDir, originalName);
    const destination = path.join(imagesDir, newNameWithoutExt + ext);
    if (path.dirname(source) !== imagesDir || path.dirname(destination) !== imagesDir ||
        !(await fs.lstat(source)).isFile() || await fs.realpath(source) !== source) {
        throw new Error('Photo must be a regular file inside the image directory');
    }
    if (source === destination) return { success: true, newNameWithoutExt };

    // Exclusive creation prevents concurrent requests from overwriting a file.
    await fs.link(source, destination);
    await fs.unlink(source);
    await execFileAsync(process.execPath, [path.join(rootDir, 'scripts', 'optimize-images.mjs')], {
        timeout: 120_000,
        maxBuffer: 1024 * 1024,
    });
    return { success: true, newNameWithoutExt };
}
