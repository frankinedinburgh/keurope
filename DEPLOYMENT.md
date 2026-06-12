# Keurope Deployment Guide

This project is configured for **automated deployment** to Vercel (frontend) and Railway (backend).

## Quick Start (One-time Setup)

### 1. Get Required Tokens

**Vercel:**
- Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
- Create new token, copy it

**Railway:**
- Go to [railway.app/account/tokens](https://railway.app/account/tokens)
- Create new token, copy it

### 2. Add GitHub Secrets

In your GitHub repo:
1. Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | Your Vercel token |
| `RAILWAY_TOKEN` | Your Railway token |
| `VERCEL_ORG_ID` | From Vercel settings |
| `VERCEL_PROJECT_ID` | From Vercel project |
| `RAILWAY_PROJECT_ID` | From Railway project |
| `RAILWAY_SERVICE_ID` | From Railway Backend service |

### 3. Run Setup Script

```bash
chmod +x scripts/setup-deployment.sh
./scripts/setup-deployment.sh
```

This will:
- ✅ Configure Vercel for frontend
- ✅ Configure Railway for backend
- ✅ Set up custom domains
- ✅ Configure DNS records

### 4. Push to GitHub

```bash
git add .
git commit -m "Add deployment automation"
git push origin main
```

**GitHub Actions will now auto-deploy on every push!**

---

## Manual Deployment (if needed)

**Frontend:**
```bash
cd frontend && vercel --prod
```

**Backend:**
```bash
cd backend && railway up
```

---

## DNS Records (Already Configured)

| Subdomain | Type | Points To |
|-----------|------|-----------|
| (root) | CNAME | Vercel |
| www | CNAME | Vercel |
| api | CNAME | Railway |

All managed through Vercel's domain settings.

---

## Environment Variables

### Frontend
Set in Vercel dashboard:
- `VITE_API_BASE` = `https://api.k-europe.com`

### Backend
Set in Railway dashboard:
- `PORT` = `5000`
- Database credentials (if needed)

---

## Troubleshooting

**Frontend not deploying?**
- Check Vercel token is valid
- Verify `frontend/` directory exists
- Check `vercel.json` configuration

**Backend not deploying?**
- Check Railway token is valid
- Verify `backend/` directory exists
- Ensure `railway.json` is present

**DNS not working?**
- Wait 5-10 minutes for propagation
- Check Vercel domain settings
- Verify CNAME records in Vercel DNS

---

## What Gets Automated

✅ Frontend builds and deploys (on push)
✅ Backend builds and deploys (on push)
✅ Environment variables configured
✅ Domains and DNS set up
✅ SSL certificates auto-provisioned

❌ Database migrations (manual for now)
❌ Data seeding (manual for now)
