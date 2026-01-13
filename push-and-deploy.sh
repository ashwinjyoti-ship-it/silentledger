#!/bin/bash
set -e

echo "🚀 The Silent Ledger - Deployment Script"
echo "========================================"
echo ""

# Commit the new deployment files
echo "📝 Committing deployment configuration..."
git add wrangler.toml _headers _redirects DEPLOYMENT.md deploy.sh push-and-deploy.sh
git commit -m "Add deployment configuration for Cloudflare Pages" || echo "No changes to commit"

# Configure GitHub remote
echo ""
echo "🔗 Configuring GitHub remote..."
GITHUB_USER="ashwinjyoti-ship-it"
REPO_NAME="silentledger"

# Remove existing origin if it exists
git remote remove origin 2>/dev/null || true

# Add new origin with SSH
git remote add origin "git@github.com:${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "📤 Pushing to GitHub..."
echo "Remote: git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
echo ""

# Try to push
if git push -u origin main 2>&1 | tee /tmp/git-push.log; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 Repository: https://github.com/${GITHUB_USER}/${REPO_NAME}"

    # Now deploy to Cloudflare
    echo ""
    echo "☁️  Deploying to Cloudflare Pages..."
    echo ""

    if npx wrangler pages deploy . --project-name="${REPO_NAME}" --branch=main; then
        echo ""
        echo "🎉 Deployment Complete!"
        echo "========================================"
        echo "📦 GitHub: https://github.com/${GITHUB_USER}/${REPO_NAME}"
        echo "🌐 Live at: https://${REPO_NAME}.pages.dev"
        echo ""
    else
        echo ""
        echo "⚠️  Cloudflare deployment encountered an issue."
        echo "You may need to:"
        echo "  1. Run: npx wrangler login"
        echo "  2. Then run: npx wrangler pages deploy . --project-name=${REPO_NAME}"
        echo ""
    fi
else
    echo ""
    echo "⚠️  GitHub push failed."

    # Check the error
    if grep -q "Repository not found" /tmp/git-push.log 2>/dev/null; then
        echo ""
        echo "The repository doesn't exist yet. Please create it first:"
        echo "  1. Go to: https://github.com/new"
        echo "  2. Repository name: ${REPO_NAME}"
        echo "  3. Make it Public"
        echo "  4. Don't initialize with README"
        echo "  5. Then run this script again"
        echo ""
    elif grep -q "Permission denied" /tmp/git-push.log 2>/dev/null; then
        echo ""
        echo "SSH authentication issue. Make sure your SSH key is added to GitHub:"
        echo "  https://github.com/settings/keys"
        echo ""
    else
        echo ""
        echo "Please check the error message above and try again."
        echo ""
    fi
    exit 1
fi
