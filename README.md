# 📱 WhatsApp Message Summarizer

An AI-powered web app that automatically summarizes WhatsApp group messages for any time period you choose. Never miss important discussions again!

## Features

✅ **Auto-connect to WhatsApp** - Secure QR code login (one-time setup)  
✅ **Select any group** - Choose from all your WhatsApp groups  
✅ **Flexible time periods** - Last 6 hours, 12 hours, 24 hours, 2 days, 3 days, 1 week  
✅ **AI-powered summaries** - Uses Claude API for intelligent summarization  
✅ **No message storage** - Summaries generated on-demand, nothing saved  
✅ **Daily catchup** - Perfect for staying updated on busy group chats  

## Architecture

```
┌─────────────────────────────────────────┐
│  Browser (React)                        │
│  Vercel Deployment                      │
│  Auto-deploy from GitHub                │
└──────────────┬──────────────────────────┘
               │ API calls
               ↓
┌──────────────────────────────────────────┐
│  Backend (Node.js)                      │
│  Railway Deployment                     │
│  whatsapp-web.js + Claude API           │
│  Auto-deploy from GitHub                │
└──────────────────────────────────────────┘
```

## Prerequisites

Before you start, make sure you have:

1. **GitHub Account** - For code hosting
2. **Claude API Key** - Get it from [console.anthropic.com](https://console.anthropic.com)
3. **Vercel Account** - Free tier at [vercel.com](https://vercel.com)
4. **Railway Account** - Free tier at [railway.app](https://railway.app)
5. **Node.js 18+** - For local testing (optional)

## Local Setup (Testing)

### 1. Clone/Download the project

```bash
cd whatsapp-summarizer
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Create Environment Files

**Backend** - Create `backend/.env`:
```
PORT=3001
CLAUDE_API_KEY=sk-ant-... (your actual Claude API key)
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** - Create `frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:3001
```

### 5. Start Backend

```bash
cd backend
npm start
```

You should see:
```
Backend server running on port 3001
```

First time will show a QR code in the terminal. **Scan it with your phone** to authenticate.

### 6. Start Frontend (in another terminal)

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Deploy to Vercel + Railway

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `whatsapp-summarizer`
3. Make it **Public** (Railway needs public access)
4. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
cd whatsapp-summarizer
git init
git add .
git commit -m "Initial commit: WhatsApp summarizer app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-summarizer.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 3: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Connect your GitHub account (first time only)
5. Select `whatsapp-summarizer` repo
6. Click **"Deploy"**
7. Wait for build to complete

#### Configure Railway Environment Variables

Once deployed:

1. In Railway dashboard, click on your project
2. Click the **Variables** tab
3. Add these variables:
   - `CLAUDE_API_KEY` = your Claude API key (from console.anthropic.com)
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `FRONTEND_URL` = (leave empty for now, add after Vercel deployment)

4. Redeploy: Click **Deploy** button

#### Get Your Backend URL

1. In Railway, click **Settings**
2. Look for **Railway Public Domain** - copy this URL
3. It looks like: `https://your-service-abc123.railway.app`

---

### Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Import your GitHub repo `whatsapp-summarizer`
5. For **Root Directory**, select `frontend/`
6. Click **"Deploy"**

#### Configure Vercel Environment Variables

1. In Vercel dashboard, click your project
2. Go to **Settings** → **Environment Variables**
3. Add this variable:
   - `VITE_BACKEND_URL` = `https://your-service-abc123.railway.app` (from Railway step 3)
4. Click **"Save"**
5. Redeploy: Go to **Deployments** → click the 3 dots on latest → **Redeploy**

---

### Step 5: Update Railway Backend URL

1. Go back to Railway dashboard
2. Click your project → **Variables** tab
3. Update `FRONTEND_URL` = `https://your-vercel-deployment.vercel.app` (from Vercel)
4. Redeploy

---

## Usage

### First Time Setup
1. Open your Vercel frontend URL
2. The app will show "Connecting..."
3. A **QR code** will appear in Railway logs
4. Check Railway dashboard: Click your service → **Logs** tab
5. Scan the QR code with your **WhatsApp phone**
6. Once connected, you'll see "Connected ✓"

### Using the App
1. Select a WhatsApp group from the dropdown
2. Choose a time period (last 24 hours, etc.)
3. Click **"Summarize Messages"**
4. Get instant AI-powered summary!

---

## Troubleshooting

### QR Code Not Showing?
- Check Railway logs: Dashboard → Your Project → Logs
- Look for "QR Code received, scan with your phone:"
- If not there, redeploy the project

### Backend connection error?
- Make sure `VITE_BACKEND_URL` is correct in Vercel env vars
- Check Railway app is running (status should be "Running")
- Verify `FRONTEND_URL` is set in Railway env vars

### No groups showing?
- WhatsApp might have disconnected
- Redeploy Railway project to re-authenticate
- You may need to scan QR code again

### "WhatsApp not ready" error?
- Check Railway logs for QR code
- Scan the QR code with your phone
- Wait 30 seconds and retry

---

## Auto-Deployment

Both Vercel and Railway are set up to auto-deploy on every GitHub push!

```bash
# Make a change locally
git add .
git commit -m "Your changes"
git push origin main

# → Automatically deploys to both Vercel and Railway
```

---

## API Endpoints

The backend provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/status` | GET | WhatsApp connection status |
| `/api/groups` | GET | List all WhatsApp groups |
| `/api/summarize` | POST | Summarize group messages |
| `/api/messages` | POST | Fetch raw messages (debugging) |

### Example: Summarize Messages
```bash
curl -X POST http://localhost:3001/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "123456789-1234567890@g.us",
    "hours": 24
  }'
```

---

## Security Notes

🔒 **Your privacy is protected:**
- Messages are NOT stored anywhere
- QR code authentication keeps session secure
- Claude API key is kept on backend (not exposed to frontend)
- No message data is logged or saved

---

## Cost

### Free Tier
- **Vercel**: 100GB bandwidth/month (free)
- **Railway**: $5 credit/month (free tier)
- **Claude API**: Pay-per-use (~$0.01-0.05 per summary)

### Typical Usage
- Summarizing 100 messages: ~$0.02
- Daily summaries for 30 days: ~$0.60

---

## Support

If you encounter issues:

1. Check Railway logs for connection errors
2. Verify environment variables are set correctly
3. Make sure QR code has been scanned
4. Try redeploying the project

---

## License

MIT - Feel free to use and modify!

---

## Made with ❤️

Built with React, Node.js, WhatsApp Web.js, and Claude AI.
