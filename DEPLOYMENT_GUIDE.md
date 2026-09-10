# 🚀 Complete Deployment Guide

This guide will walk you through deploying the WhatsApp Summarizer to Vercel (Frontend) and Railway (Backend) with automatic code compilation from GitHub.

## 📋 Checklist Before Starting

- [ ] GitHub account created
- [ ] Claude API key (from console.anthropic.com)
- [ ] Vercel account (free tier)
- [ ] Railway account (free tier)
- [ ] Node.js 18+ installed (for local testing)

---

## PART 1: GitHub Setup

### Step 1.1: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `whatsapp-summarizer`
   - **Description**: WhatsApp message summarizer with AI
   - **Public**: Yes (Railway needs public access)
3. Click "Create repository"

### Step 1.2: Push Code to GitHub

Open terminal/PowerShell in your project directory:

```bash
git init
git add .
git commit -m "Initial commit: WhatsApp summarizer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-summarizer.git
git push -u origin main
```

**Replace** `YOUR_USERNAME` with your actual GitHub username.

✅ Your code is now on GitHub!

---

## PART 2: Backend Deployment (Railway)

### Step 2.1: Sign Up to Railway

1. Go to https://railway.app
2. Click "Start Free"
3. Sign up with GitHub (recommended)
4. Authorize Railway to access your GitHub account

### Step 2.2: Create New Project

1. In Railway dashboard, click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Find and select `whatsapp-summarizer`
4. Click **"Deploy Now"**
5. Wait for build to complete (~2-3 minutes)

### Step 2.3: Configure Environment Variables

Once deployment is done:

1. In Railway dashboard, click on your project
2. Click on the **"whatsapp-summarizer"** service
3. Go to **"Variables"** tab
4. Click **"+ Add Variable"**

Add these variables one by one:

| Variable | Value |
|----------|-------|
| `CLAUDE_API_KEY` | Your actual Claude API key from console.anthropic.com |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `FRONTEND_URL` | (Leave empty for now - update after Vercel setup) |

5. After adding all variables, click **"Deploy"** button to redeploy

### Step 2.4: Get Your Backend URL

1. In Railway, click on your project
2. Click **"Settings"** tab
3. Scroll to **"Domains"** section
4. Look for your **Railway Public Domain** - it looks like:
   ```
   https://whatsapp-summarizer-production-abc123.railway.app
   ```
5. **Copy this URL** - you'll need it for Vercel

✅ Backend is deployed!

---

## PART 3: Frontend Deployment (Vercel)

### Step 3.1: Sign Up to Vercel

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### Step 3.2: Import Project

1. In Vercel dashboard, click **"Add New"** → **"Project"**
2. Click **"Import Git Repository"**
3. Search for and select `whatsapp-summarizer`
4. Click **"Import"**

### Step 3.3: Configure Root Directory

When Vercel asks for configuration:

1. **Root Directory**: Select `frontend/` from dropdown
2. **Framework**: It should auto-detect "Vite"
3. Click **"Continue"** → **"Deploy"**

Vercel will build and deploy (~2-3 minutes)

### Step 3.4: Set Environment Variables

Once deployment is done:

1. Click on your project in Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Fill in:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: Paste your Railway URL from Step 2.4
   - **Environments**: Check "Production", "Preview", "Development"
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click the three dots `...` on latest deployment
8. Click **"Redeploy"**

### Step 3.5: Get Your Frontend URL

1. Click on your Vercel project
2. At the top, you'll see your Vercel URL like:
   ```
   https://whatsapp-summarizer.vercel.app
   ```
3. **Copy this URL**

✅ Frontend is deployed!

---

## PART 4: Final Setup

### Step 4.1: Update Railway Backend URL

1. Go back to Railway dashboard
2. Click on your project → your service
3. Go to **"Variables"** tab
4. Update `FRONTEND_URL` variable:
   - **Value**: Your Vercel URL from Step 3.5
5. Click **"Deploy"** to redeploy with the updated variable

### Step 4.2: Verify Everything

Open your Vercel URL in a browser:
```
https://your-project.vercel.app
```

You should see:
- ⏳ "Connecting..." status
- Once WhatsApp is authenticated: ✓ "Connected"

---

## PART 5: First-Time WhatsApp Authentication

### Step 5.1: Get QR Code

The first time you use the app, you need to scan a QR code:

1. Open your Vercel frontend
2. Status shows "⏳ Connecting..."
3. Check Railway logs for QR code:
   - Go to Railway dashboard
   - Click your project → service
   - Click **"Logs"** tab
   - Look for: `QR Code received, scan with your phone:`
   - The QR code will be printed in ASCII in the logs

### Step 5.2: Scan QR Code

1. Open **WhatsApp** on your phone
2. Go to **Settings** → **Linked Devices**
3. **Scan the QR code** shown in Railway logs
4. Your phone will authenticate the session

### Step 5.3: Start Using

Once connected:
1. Refresh your browser
2. Status will show: ✓ "Connected"
3. You can now:
   - Select a group
   - Choose time period
   - Get AI summaries!

---

## PART 6: Auto-Deployment Setup

Now that everything is deployed, here's how auto-deployment works:

### How It Works

```
Your Computer
    ↓
(git push)
    ↓
GitHub
    ↓ (webhook)
   ↙  ↘
Vercel  Railway
    ↓      ↓
   ✅  Auto-Deploy
```

### To Update Code

Just push to GitHub and both platforms auto-deploy:

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push origin main

# → Automatically deploys to Vercel and Railway!
```

---

## 📱 Using the App

### Daily Catchup Workflow

1. Open your Vercel URL
2. Select a WhatsApp group
3. Choose time period (e.g., "Last 24 hours")
4. Click "Summarize Messages"
5. Get instant AI summary of what you missed!

### Time Periods Available

- Last 6 hours
- Last 12 hours
- Last 24 hours
- Last 2 days
- Last 3 days
- Last week

---

## 🆘 Troubleshooting

### Problem: "Connecting..." never connects

**Solution:**
1. Check Railway logs for QR code
2. If no QR code in logs, redeploy Railway
3. Once QR appears, scan it with phone
4. Wait 30 seconds and refresh browser

### Problem: Backend connection error

**Solution:**
1. Verify `VITE_BACKEND_URL` is correct in Vercel env vars
2. Check Railway app status (should be "Running")
3. Make sure `FRONTEND_URL` is set in Railway env vars
4. Redeploy Vercel by clicking "Redeploy"

### Problem: "No groups showing"

**Solution:**
1. Make sure you're authenticated (✓ Connected status)
2. Try refreshing the page
3. If still not working, redeploy Railway
4. You might need to scan QR code again

### Problem: Summarization fails

**Solution:**
1. Verify `CLAUDE_API_KEY` is correct in Railway
2. Check that your Claude API key is valid
3. Make sure the group has messages in the selected time period
4. Try a different time period

### Problem: Changes not deploying

**Solution:**
1. Verify changes were pushed to GitHub: `git status`
2. Check Vercel Deployments tab to see if deployment started
3. Check Railway "Deployments" tab for status
4. Try manual redeploy from dashboard

---

## 💰 Costs

### Free Resources
- **Vercel**: 100GB bandwidth/month (free tier)
- **Railway**: $5 credit/month (free tier, enough for 10-20 daily summaries)
- **GitHub**: Unlimited repos (free)

### Paid: Claude API
- **Cost**: ~$0.01-0.05 per summary
- **Daily use**: ~$0.60/month (if using daily)

---

## 🔒 Security

Your data is safe:
- ✅ Messages are NOT stored
- ✅ QR authentication is secure
- ✅ Claude API key stored only on backend (never exposed to frontend)
- ✅ All communication is encrypted (HTTPS)

---

## 📞 Support

If you get stuck:

1. **Check logs**:
   - Railway: Logs tab in service
   - Vercel: Deployments → click deployment → see logs

2. **Verify environment variables**:
   - All 4 Railway variables set?
   - Vercel variable set with correct backend URL?

3. **Re-authenticate**:
   - Redeploy Railway
   - Scan QR code again
   - Refresh browser

---

## ✅ You're Done!

Your WhatsApp Summarizer is now:
- ✅ Running on Vercel (frontend)
- ✅ Running on Railway (backend)
- ✅ Auto-deploying from GitHub
- ✅ Ready to summarize your group chats!

**Happy summarizing!** 🎉
