# 🚀 Quick Start (5 minutes)

## For the Impatient 

### Prerequisites
- ✅ GitHub account
- ✅ Claude API key (from console.anthropic.com)
- ✅ Vercel account (vercel.com)
- ✅ Railway account (railway.app)

---

## 1️⃣ Push to GitHub (1 min)

```bash
cd whatsapp-summarizer
git init
git add .
git commit -m "Initial"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-summarizer.git
git push -u origin main
```

---

## 2️⃣ Deploy Backend to Railway (2 min)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `whatsapp-summarizer`
5. Click "Deploy Now"
6. Wait for build...

**Once done:**
1. Go to "Variables" tab
2. Add:
   - `CLAUDE_API_KEY` = your key
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
3. Click "Deploy"
4. Copy your **Railway URL** from Settings → Domains

---

## 3️⃣ Deploy Frontend to Vercel (2 min)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Select `whatsapp-summarizer` repo
5. **Root Directory**: `frontend/`
6. Click "Deploy"
7. Wait for build...

**Once done:**
1. Go to Settings → Environment Variables
2. Add: `VITE_BACKEND_URL` = your Railway URL
3. Go to Deployments, redeploy latest
4. Copy your **Vercel URL**

---

## 4️⃣ Final Config (1 min)

Back to Railway:
1. Go to Variables
2. Update `FRONTEND_URL` = your Vercel URL
3. Click "Deploy"

---

## 5️⃣ Done! 

Open your Vercel URL → Scan QR code → Summarize! 🎉

---

## ❓ Issues?

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) Troubleshooting section
