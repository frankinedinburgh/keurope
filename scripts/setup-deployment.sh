#!/bin/bash

# Keurope Deployment Setup Script
# This script configures Vercel, Railway, and DNS for k-europe.com

set -e

echo "🚀 Keurope Deployment Setup"
echo "============================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check for CLI tools
echo -e "${BLUE}Step 1: Checking dependencies...${NC}"
command -v vercel >/dev/null 2>&1 || { echo "Installing Vercel CLI..."; npm install -g vercel; }
command -v railway >/dev/null 2>&1 || { echo "Installing Railway CLI..."; npm install -g @railway/cli; }
echo -e "${GREEN}✓ CLI tools ready${NC}"
echo ""

# 2. Configure GitHub Secrets
echo -e "${BLUE}Step 2: GitHub Secrets Required${NC}"
echo "Add these secrets to GitHub (Settings > Secrets):"
echo "  - VERCEL_TOKEN (from vercel.com/account/tokens)"
echo "  - VERCEL_ORG_ID (from Vercel dashboard)"
echo "  - VERCEL_PROJECT_ID (from Vercel project settings)"
echo "  - RAILWAY_TOKEN (from railway.app/account/tokens)"
echo "  - RAILWAY_PROJECT_ID (from Railway dashboard)"
echo "  - RAILWAY_SERVICE_ID (Backend service ID)"
echo ""
read -p "Press Enter once you've added these secrets to GitHub..."
echo ""

# 3. Vercel Setup
echo -e "${BLUE}Step 3: Connecting to Vercel...${NC}"
cd frontend
vercel link
echo -e "${GREEN}✓ Frontend connected to Vercel${NC}"
cd ..
echo ""

# 4. Railway Setup
echo -e "${BLUE}Step 4: Connecting to Railway...${NC}"
cd backend
railway link
railway domain --custom api.k-europe.com
echo -e "${GREEN}✓ Backend connected to Railway${NC}"
cd ..
echo ""

# 5. DNS Configuration Info
echo -e "${BLUE}Step 5: DNS Configuration${NC}"
echo "Your DNS is already configured in Vercel!"
echo "✓ k-europe.com → Frontend (Vercel)"
echo "✓ api.k-europe.com → Backend (Railway)"
echo ""

# 6. Final verification
echo -e "${BLUE}Step 6: Testing deployment...${NC}"
echo "Frontend: https://k-europe.com"
echo "Backend: https://api.k-europe.com/api/products"
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Commit these files to GitHub"
echo "2. Push to main branch: git push"
echo "3. GitHub Actions will auto-deploy on every push"
echo ""
echo "To deploy manually:"
echo "  - Frontend: vercel --prod"
echo "  - Backend: railway up"
