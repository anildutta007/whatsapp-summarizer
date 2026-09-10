import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import whatsappPkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = whatsappPkg;
import Anthropic from '@anthropic-ai/sdk';
import qrcode from 'qrcode-terminal';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

// Initialize WhatsApp client
let whatsappClient;
let isReady = false;
let qrCodeGenerated = false;

function initWhatsApp() {
  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  whatsappClient.on('qr', (qr) => {
    console.log('QR Code received, scan with your phone:');
    qrcode.generate(qr, { small: true });
    qrCodeGenerated = true;
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isReady = true;
    qrCodeGenerated = false;
  });

  whatsappClient.on('message_create', (msg) => {
    // Log messages if needed
    console.log('Message from', msg.from);
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('Client disconnected:', reason);
    isReady = false;
  });

  whatsappClient.initialize();
}

// Initialize WhatsApp on startup
initWhatsApp();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    whatsappReady: isReady,
    qrCodeGenerated
  });
});

// Get WhatsApp status
app.get('/api/status', (req, res) => {
  if (!isReady) {
    return res.status(503).json({
      ready: false,
      message: qrCodeGenerated
        ? 'Waiting for QR code scan. Please scan with your phone.'
        : 'Initializing WhatsApp...'
    });
  }
  res.json({ ready: true, message: 'WhatsApp connected' });
});

// Get all groups
app.get('/api/groups', async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({ error: 'WhatsApp not ready' });
    }

    const chats = await whatsappClient.getChats();
    const groups = chats
      .filter(chat => chat.isGroup)
      .map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        participantCount: chat.participants.length
      }));

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: error.message });
  }
});

// Summarize messages from a group
app.post('/api/summarize', async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({ error: 'WhatsApp not ready' });
    }

    const { groupId, hours = 24 } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'groupId is required' });
    }

    // Get the chat
    const chat = await whatsappClient.getChatById(groupId);

    if (!chat) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Calculate time threshold
    const now = Date.now();
    const timeThreshold = now - (hours * 60 * 60 * 1000);

    // Fetch messages from the chat
    const messages = await chat.fetchMessages({ limit: 1000 });

    // Filter messages by time period
    const filteredMessages = messages.filter(msg => {
      const msgTime = msg.timestamp * 1000; // WhatsApp uses seconds, convert to ms
      return msgTime >= timeThreshold;
    });

    if (filteredMessages.length === 0) {
      return res.json({
        group: chat.name,
        period: `${hours} hours`,
        messageCount: 0,
        summary: 'No messages found in the specified time period.'
      });
    }

    // Format messages for Claude
    const formattedMessages = filteredMessages
      .map(msg => {
        const author = msg.author || 'Unknown';
        const body = msg.body || '[Media]';
        const time = new Date(msg.timestamp * 1000).toLocaleString();
        return `${time} - ${author}: ${body}`;
      })
      .join('\n');

    // Send to Claude for summarization
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Please summarize the following WhatsApp group chat messages from the last ${hours} hours. Focus on key topics, decisions, and important information. Format the summary with bullet points for clarity.\n\n${formattedMessages}`
        }
      ]
    });

    const summary = response.content[0].text;

    res.json({
      group: chat.name,
      period: `${hours} hours`,
      messageCount: filteredMessages.length,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error summarizing messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages (for debugging)
app.post('/api/messages', async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({ error: 'WhatsApp not ready' });
    }

    const { groupId, hours = 24 } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'groupId is required' });
    }

    const chat = await whatsappClient.getChatById(groupId);

    if (!chat) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const now = Date.now();
    const timeThreshold = now - (hours * 60 * 60 * 1000);

    const messages = await chat.fetchMessages({ limit: 1000 });

    const filteredMessages = messages
      .filter(msg => {
        const msgTime = msg.timestamp * 1000;
        return msgTime >= timeThreshold;
      })
      .map(msg => ({
        author: msg.author || 'Unknown',
        body: msg.body || '[Media]',
        timestamp: new Date(msg.timestamp * 1000).toISOString()
      }));

    res.json({
      group: chat.name,
      period: `${hours} hours`,
      messageCount: filteredMessages.length,
      messages: filteredMessages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
