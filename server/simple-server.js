require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(helmet());

// Allow frontend origins (adjust if necessary)
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3002'] }));
app.options('*', cors());

// Health check
app.get('/', (req, res) => res.send('API proxy OK'));

// Proxy endpoint with mock fallback when no API key
app.post('/api/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock response for local development/testing
      return res.json({
        mock: true,
        message: 'No GEMINI_API_KEY configured — returning mock response for development',
        input: req.body,
        generated: [
          { text: 'AI singkat: AI memproses data dan menghasilkan prediksi atau teks.' },
        ],
      });
    }

    // Real request to Gemini (only when API key present)
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
