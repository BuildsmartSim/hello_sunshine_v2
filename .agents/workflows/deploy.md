---
description: Standard procedure to prepare and deploy Hello Sunshine to the production server
---

# 🚀 Hello Sunshine Deployment System

Whenever the user asks to "deploy to production" or "update the live site", follow this exact step-by-step procedure to ensure the application doesn't crash from unfinished code, push blocked secrets, or massive file uploads.

## Step 1: Pre-Commit Safety Checks
1. Use `git status` to see what is currently modified/untracked.
2. Check for massive unoptimized asset directories (e.g., raw `.jpg` dumps or `.zip` files) and ensure they are added to `.gitignore`. GitHub will block pushes over 100MB per file and very large total commit sizes.
3. Check for any accidentally exposed secrets (like Stripe Secret Keys or Supabase Service Keys) in any newly created scripts.

## Step 2: Local Production Build Test (CRITICAL)
NEVER tell the user to pull code to their live server without running a local build simulation first. Next.js applications will crash in production and take the site offline if TypeScript or module resolution fails.
// turbo
1. Run `npm run build` locally in the project workspace (allow up to 60 seconds).
2. If `npm run build` fails, you MUST fix the build errors before attempting to push.

## Step 3: Git Commit & Push
// turbo-all
1. Stage all safe modifications: `git add .`
2. Commit with a meaningful, descriptive message: `git commit -m "feat: [describe features]"`
3. Push to main: `git push`
4. If the push fails due to GitHub Push Protection (e.g., secrets in code) or file size limits, immediately:
   - Run `git reset HEAD~1` to undo the commit
   - Discard the offending file (e.g., `git rm -r --cached <offending_file>`) or add the path to `.gitignore`
   - Re-commit and attempt the push again

## Step 4: DigitalOcean Droplet Deployment
Once the Git Push cleanly succeeds, notify the user with the EXACT deployment script required for their DigitalOcean droplet environment.

Provide the user exactly this message using the `notify_user` tool:

"Your code has been verified and securely pushed to GitHub! Please run the following command block directly on your DigitalOcean terminal to sync and restart the live server:"

```bash
cd /root/hello_sunshine_v2
git pull
npm install
# Ensure swap space exists to prevent OOM kills during the next build
sudo fallocate -l 2G /swapfile || true
sudo chmod 600 /swapfile || true
sudo mkswap /swapfile || true
sudo swapon /swapfile || true
npm run build
pm2 reload hellosunshine
```

### 🚨 Emergency / Broken Deployment Override
If the user reports that `git pull` failed on the server, or the site styling broke completely after a pull (e.g., infinite scaling images or missing CSS), the server's Git state or Next.js build cache is corrupted. 

In this scenario, provide them the "Hard Reset" terminal sequence instead:

```bash
cd /root/hello_sunshine_v2
git fetch origin main
git reset --hard origin/main
npm install
# Ensure swap space exists to prevent OOM kills during the next build
sudo fallocate -l 2G /swapfile || true
sudo chmod 600 /swapfile || true
sudo mkswap /swapfile || true
sudo swapon /swapfile || true
npm run build
pm2 reload hellosunshine
```
