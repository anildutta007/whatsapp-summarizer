# 📁 Project Structure

## Overview

```
whatsapp-summarizer/
├── backend/                    # Node.js Backend
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment variables template
│   ├── Procfile               # Railway deployment config
│   ├── Dockerfile             # Docker config
│   └── vercel.json            # Vercel config (optional)
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── App.css            # Styling
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite config
│   ├── vercel.json            # Vercel deployment config
│   ├── .env.example           # Environment template
│   ├── Dockerfile             # Docker config
│   └── public/                # Static assets
│
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions (auto-deploy)
│
├── .gitignore                 # Git ignore rules
├── README.md                  # Main documentation
├── DEPLOYMENT_GUIDE.md        # Step-by-step deployment
├── QUICK_START.md             # Quick reference
├── PROJECT_STRUCTURE.md       # This file
└── docker-compose.yml         # Docker compose for local dev
```

---

## Key Files Explained

### Backend

**`backend/server.js`**
- Initializes WhatsApp client with `whatsapp-web.js`
- Provides REST API endpoints:
  - `GET /api/status` - WhatsApp connection status
  - `GET /api/groups` - List all groups
  - `POST /api/summarize` - Summarize messages
  - `POST /api/messages` - Fetch raw messages
- Integrates with Claude API for summarization

**`backend/package.json`**
- Dependencies:
  - `express` - Web server
  - `whatsapp-web.js` - WhatsApp Web automation
  - `@anthropic-ai/sdk` - Claude API
  - `cors` - Cross-origin requests
  - `dotenv` - Environment variables

---

### Frontend

**`frontend/src/App.jsx`**
- Main React component
- Features:
  - Connection status indicator
  - Group selection dropdown
  - Time period picker
  - Summarize button
  - Results display with metadata

**`frontend/src/App.css`**
- Beautiful gradient UI
- Responsive design (mobile-friendly)
- Dark/light mode support
- Smooth animations

**`frontend/package.json`**
- Dependencies:
  - `react` - UI framework
  - `vite` - Build tool
  - `axios` - HTTP client

---

### Deployment Configs

**`backend/Procfile`**
- Tells Railway how to start the backend
- Command: `node server.js`

**`frontend/vercel.json`**
- Tells Vercel how to build/deploy frontend
- Build command: `npm run build`
- Output directory: `dist/`

**`docker-compose.yml`**
- Local development setup
- Runs both backend and frontend
- Useful for testing before deployment

---

### Environment Variables

**Backend** (`.env`):
```
PORT=3001
CLAUDE_API_KEY=sk-ant-xxx
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

**Frontend** (`.env`):
```
VITE_BACKEND_URL=https://your-backend-railway.app
```

---

## Data Flow

```
User Browser
    ↓
React Frontend (Vercel)
    ↓ (API call: POST /api/summarize)
Node.js Backend (Railway)
    ↓
WhatsApp Web Client
↓ (fetches messages)
    ↓
Claude API
    ↓ (generates summary)
    ↓
Frontend displays result
```

---

## Dependencies

### Backend
- `express@4.18.2` - Web server framework
- `whatsapp-web.js@1.25.1` - WhatsApp Web client
- `@anthropic-ai/sdk@0.16.0` - Claude API SDK
- `cors@2.8.5` - CORS middleware
- `dotenv@16.3.1` - Environment variables
- `axios@1.6.0` - HTTP client
- `qrcode-terminal@0.12.0` - QR code display

### Frontend
- `react@18.2.0` - UI library
- `react-dom@18.2.0` - React DOM renderer
- `axios@1.6.0` - HTTP client
- `vite@5.0.7` - Build tool

---

## API Endpoints Reference

### `GET /api/status`
Returns WhatsApp connection status.

**Response:**
```json
{
  "ready": true,
  "message": "WhatsApp connected"
}
```

### `GET /api/groups`
Returns list of all WhatsApp groups.

**Response:**
```json
[
  {
    "id": "123456789-1234567890@g.us",
    "name": "Friends Group",
    "participantCount": 8
  }
]
```

### `POST /api/summarize`
Summarizes messages from a group.

**Request:**
```json
{
  "groupId": "123456789-1234567890@g.us",
  "hours": 24
}
```

**Response:**
```json
{
  "group": "Friends Group",
  "period": "24 hours",
  "messageCount": 45,
  "summary": "Key topics discussed...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Build & Deployment

### Local Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Production Build
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm install
npm run build
# Output in: frontend/dist/
```

### Docker
```bash
docker-compose up
# Runs both services on localhost:3000 and localhost:3001
```

---

## Environment Setup

### What Gets Set Where

| Variable | Where | Why |
|----------|-------|-----|
| `CLAUDE_API_KEY` | Railway | Backend needs it for API calls |
| `VITE_BACKEND_URL` | Vercel | Frontend needs to know backend URL |
| `FRONTEND_URL` | Railway | Backend needs to allow frontend CORS |
| `PORT` | Railway | Backend port (must be 3001) |
| `NODE_ENV` | Railway | Production flag |

---

## Security Considerations

✅ **Safe:**
- Messages not stored anywhere
- QR authentication (no password)
- API key kept on backend only
- HTTPS communication

❌ **Not for:**
- Financial data
- Personal health info
- Sensitive government data

---

## Performance Notes

- Average summary generation: 2-3 seconds
- API response time: ~50-100ms
- Frontend load time: ~1-2 seconds
- Backend startup time: ~10-15 seconds (first time with QR scan)

---

## Monitoring

### What to Watch

**Railway Dashboard:**
- Service status (should be "Running")
- Memory usage
- CPU usage
- Logs for errors

**Vercel Dashboard:**
- Build status
- Deployment history
- Performance metrics
- Error logs

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Connecting..." forever | WhatsApp not authenticated | Scan QR code in logs |
| Backend connection fails | Wrong URL in frontend env | Check `VITE_BACKEND_URL` |
| No groups showing | Session expired | Redeploy Railway, re-scan QR |
| Summarization fails | Invalid API key | Check `CLAUDE_API_KEY` |

---

## Next Steps

1. ✅ Review this structure
2. ✅ Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. ✅ Push to GitHub
4. ✅ Deploy to Railway & Vercel
5. ✅ Scan QR code
6. ✅ Start summarizing!
