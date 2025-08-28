require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Import e-commerce integration
const ecommerceIntegration = require('./ecommerce');

const app = express();
app.use(express.json());
app.use(helmet());

// izinkan origin frontend Anda (sesuaikan jika perlu)
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3002'] }));
app.options('*', cors());

// rate limiter sederhana
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});
app.use('/api/', limiter);

// Initialize e-commerce integration
ecommerceIntegration.initialize().catch(console.error);

// health check
app.get('/', (req, res) => res.send('API proxy OK'));

// E-commerce integration endpoints
app.get('/api/ecommerce/status', (req, res) => {
  try {
    const status = ecommerceIntegration.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ecommerce/sync/:platform?', async (req, res) => {
  try {
    const { platform } = req.params;
    const result = await ecommerceIntegration.manualSync(platform);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoints for each platform
app.post('/api/webhook/shopee', async (req, res) => {
  try {
    const result = await ecommerceIntegration.handleWebhook('shopee', req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/webhook/tokopedia', async (req, res) => {
  try {
    const result = await ecommerceIntegration.handleWebhook('tokopedia', req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/webhook/tiktokshop', async (req, res) => {
  try {
    const result = await ecommerceIntegration.handleWebhook('tiktokshop', req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Platform configuration endpoints
app.post('/api/ecommerce/connect/shopee', async (req, res) => {
  try {
    const { apiKey, apiSecret, partnerId, shopId } = req.body;
    await ecommerceIntegration.connectPlatform('shopee', {
      apiKey, apiSecret, partnerId, shopId, enabled: true
    });
    res.json({ success: true, message: 'Shopee connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ecommerce/connect/tokopedia', async (req, res) => {
  try {
    const { clientId, clientSecret, fsId } = req.body;
    await ecommerceIntegration.connectPlatform('tokopedia', {
      clientId, clientSecret, fsId, enabled: true
    });
    res.json({ success: true, message: 'Tokopedia connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ecommerce/connect/tiktokshop', async (req, res) => {
  try {
    const { appKey, appSecret, shopId, authCode } = req.body;
    await ecommerceIntegration.connectPlatform('tiktokshop', {
      appKey, appSecret, shopId, authCode, enabled: true
    });
    res.json({ success: true, message: 'TikTok Shop connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Disconnect platform
app.post('/api/ecommerce/disconnect/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    ecommerceIntegration.disconnectPlatform(platform);
    res.json({ success: true, message: `${platform} disconnected successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// proxy endpoint with mock fallback when no API key
app.post('/api/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock response for local development / testing
      return res.json({
        mock: true,
        message: 'No GEMINI_API_KEY configured — returning mock response for development',
        input: req.body,
        generated: [
          { text: 'AI singkat: AI memproses data dan menghasilkan prediksi atau teks.' },
        ],
      });
    }

    // real request to Gemini (only when API key present)
    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API proxy running on ${port}`));
