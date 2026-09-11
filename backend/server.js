import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Boom } from '@hapi/boom';
import P from 'pino';
import * as fs from 'fs';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import QRCode from 'qrcode';
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, proto } from '@whiskeysockets/baileys';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({});

let sock;
let isReady = false;
let currentQRCode = null;
const authDir = './auth_info_baileys';

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: logger,
    browser: ['Ubuntu', 'Chrome', '120.0.0.0']
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        currentQRCode = await QRCode.toDataURL(qr);
        console.log('QR Code Generated - Scan with your phone');
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp connected!');
      isReady = true;
    }

    if (connection === 'close') {
      let shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed, reconnect:', shouldReconnect);
      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 3000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('messages.upsert', () => {});
}

connectToWhatsApp();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', whatsappReady: isReady });
});

app.get('/api/status', (req, res) => {
  if (!isReady) {
    return res.status(503).json({
      ready: false,
      message: currentQRCode ? 'Waiting for QR code scan' : 'Initializing...'
    });
  }
  res.json({ ready: true, message: 'WhatsApp connected' });
});

app.get('/qr', (req, res) => {
  if (!currentQRCode) {
    return res.status(404).json({ error: 'No QR code available' });
  }
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html><html><head><title>WhatsApp QR</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0f0f0}.container{text-align:center;background:white;padding:30px;border-radius:10px}img{max-width:400px}</style></head><body><div class="container"><h1>📱 Scan QR Code</h1><img src="${currentQRCode}" alt="QR"><p>Scan with WhatsApp Settings → Linked Devices</p></div></body></html>`);
});

app.get('/api/groups', async (req, res) => {
  try {
    if (!isReady || !sock) {
      return res.status(503).json({ error: 'WhatsApp not ready' });
    }

    const chats = await sock.fetchAllSingleChats();
    const groups = chats
      .filter(chat => chat.id.endsWith('@g.us'))
      .map(chat => ({
        id: chat.id,
        name: chat.name || chat.subject || 'Unknown',
        participants: chat.participants?.length || 0
      }));

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    if (!isReady || !sock) {
      return res.status(503).json({ error: 'WhatsApp not ready' });
    }

    const { groupId, hours = 24 } = req.body;
    if (!groupId) {
      return res.status(400).json({ error: 'groupId required' });
    }

    const now = Date.now();
    const timeThreshold = now - (hours * 60 * 60 * 1000);

    const messages = [];
    let cursor = 0;

    try {
      const result = await sock.loadConversation(groupId, 100);
      for (const msg of result) {
        if (msg.messageTimestamp * 1000 >= timeThreshold) {
          const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Media]';
          const sender = msg.key.fromMe ? 'You' : msg.pushName || 'Unknown';
          messages.push({ sender, text, time: new Date(msg.messageTimestamp * 1000).toISOString() });
        }
      }
    } catch (e) {
      console.log('Load conversation error:', e);
    }

    if (messages.length === 0) {
      return res.json({ group: groupId, period: `${hours}h`, messageCount: 0, summary: 'No messages found' });
    }

    const formattedMessages = messages.map(m => `${m.time} - ${m.sender}: ${m.text}`).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Summarize these WhatsApp messages from the last ${hours} hours:\n\n${formattedMessages}`
      }]
    });

    res.json({
      group: groupId,
      period: `${hours}h`,
      messageCount: messages.length,
      summary: response.content[0].text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    if (!isReady || !sock) {
      return res.status(503).json({ error: 'WhatsApp not ready' });
    }

    const { groupId, hours = 24 } = req.body;
    if (!groupId) {
      return res.status(400).json({ error: 'groupId required' });
    }

    const now = Date.now();
    const timeThreshold = now - (hours * 60 * 60 * 1000);
    const messages = [];

    try {
      const result = await sock.loadConversation(groupId, 100);
      for (const msg of result) {
        if (msg.messageTimestamp * 1000 >= timeThreshold) {
          messages.push({
            sender: msg.key.fromMe ? 'You' : msg.pushName || 'Unknown',
            text: msg.message?.conversation || '[Media]',
            timestamp: new Date(msg.messageTimestamp * 1000).toISOString()
          });
        }
      }
    } catch (e) {
      console.log('Error:', e);
    }

    res.json({ group: groupId, period: `${hours}h`, messageCount: messages.length, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
