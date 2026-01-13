# Deployment Guide

This guide will help you deploy The Silent Ledger to GitHub and Cloudflare Pages.

## Prerequisites

✅ Git repository initialized (DONE)
✅ Initial commit created (DONE)
✅ SSH authentication configured (DONE)

## Step 1: Create GitHub Repository

1. Open your browser and go to: https://github.com/new
2. Fill in the details:
   - **Repository name**: `silentledger`
   - **Description**: `The Silent Ledger - Offline-first personal stock portfolio archival app`
   - **Visibility**: Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click "Create repository"

## Step 2: Push to GitHub

Once the repository is created on GitHub, run these commands:

```bash
cd /Volumes/MiniExternal/Projects/Papa-Baby-Shares
git remote add origin git@github.com:ashwinjyoti-ship-it/silentledger.git
git branch -M main
git push -u origin main
```

Your code will be live at: https://github.com/ashwinjyoti-ship-it/silentledger

## Step 3: Deploy to Cloudflare Pages

### Option A: Via Wrangler CLI (Command Line)

1. Login to Wrangler:
```bash
npx wrangler login
```

2. Deploy the project:
```bash
npx wrangler pages deploy . --project-name=silentledger --branch=main
```

### Option B: Via Cloudflare Dashboard (Web Interface)

1. Go to: https://dash.cloudflare.com
2. Log in to your Cloudflare account
3. Click "Pages" in the sidebar
4. Click "Create a project"
5. Choose "Connect to Git"
6. Select your GitHub repository: `silentledger`
7. Configure build settings:
   - **Build command**: (leave empty - it's a static site)
   - **Build output directory**: `/`
   - **Root directory**: `/`
8. Click "Save and Deploy"
9. Once deployed, go to "Custom domains" and add: `silentledger.pages.dev`

Your site will be live at: https://silentledger.pages.dev

## Quick Deploy Script

Alternatively, run the provided deploy script:

```bash
cd /Volumes/MiniExternal/Projects/Papa-Baby-Shares
./deploy.sh
```

This script will guide you through the entire process.

## Verification

After deployment:
- GitHub: https://github.com/ashwinjyoti-ship-it/silentledger
- Live Site: https://silentledger.pages.dev

The app should work exactly as it does locally since it's offline-first with localStorage.
