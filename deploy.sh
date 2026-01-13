#!/bin/bash
# Deployment script for The Silent Ledger
# This script will push to GitHub and deploy to Cloudflare Pages

echo "=== The Silent Ledger Deployment Script ==="
echo ""

# Step 1: Create GitHub repository
echo "Step 1: Creating GitHub repository..."
echo "Please visit: https://github.com/new"
echo "Repository name: silentledger"
echo "Description: The Silent Ledger - Offline-first personal stock portfolio archival app"
echo "Visibility: Public"
echo ""
read -p "Press Enter once you've created the repository on GitHub..."

# Step 2: Add remote and push
echo ""
echo "Step 2: Pushing to GitHub..."
git remote add origin https://github.com/ashwinjyoti/silentledger.git 2>/dev/null || git remote set-url origin https://github.com/ashwinjyoti/silentledger.git
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✓ Successfully pushed to GitHub!"
else
    echo "✗ Failed to push to GitHub. Please check your credentials."
    exit 1
fi

# Step 3: Deploy to Cloudflare Pages
echo ""
echo "Step 3: Deploying to Cloudflare Pages..."
echo "Please ensure you're logged into Wrangler (run 'npx wrangler login' if needed)"
read -p "Press Enter to continue with Cloudflare deployment..."

npx wrangler pages deploy . --project-name=silentledger --branch=main

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Deployment Complete! ==="
    echo "GitHub: https://github.com/ashwinjyoti/silentledger"
    echo "Live Site: https://silentledger.pages.dev"
else
    echo "✗ Cloudflare deployment failed. You may need to run 'npx wrangler login' first."
    exit 1
fi
