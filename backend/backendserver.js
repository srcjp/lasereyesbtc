const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const coinosUrl = process.env.COINOS_URL || 'https://coinos.io';
const coinosApiKey = process.env.COINOS_API_KEY; // JWT or API key
const coinosUsername = process.env.COINOS_USERNAME; // required by some instances
const minAmount = 150;
const envAmount = parseInt(process.env.CHARGE_AMOUNT || String(minAmount));
const chargeAmount = Math.max(envAmount, minAmount); // sats
const chargeMemo = process.env.CHARGE_MEMO || 'Laser eyes download';

// Database configuration
const pool = new Pool({
  host: process.env.PGHOST || 'db',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'lasereyes'
});

// Initialize table
pool.query(
  `CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    amount INTEGER NOT NULL,
    nostr TEXT,
    twitter TEXT,
    instagram TEXT,
    nickname TEXT,
    message TEXT,
    donated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`
).catch((err) => console.error('DB init error', err));

app.post('/invoice', async (req, res) => {
  try {
    const body = { invoice: { amount: chargeAmount, memo: chargeMemo } };
    if (coinosUsername) {
      body.user = { username: coinosUsername };
    }
    const response = await axios.post(
      `${coinosUrl}/api/invoice`,
      body,
      {
        headers: Object.assign(
          { 'Content-Type': 'application/json' },
          coinosApiKey ? { Authorization: `Bearer ${coinosApiKey}` } : {}
        ),
      },
    );
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'invoice creation failed' });
  }
});

app.get('/invoice/:paymentHash', async (req, res) => {
  try {
    const { paymentHash } = req.params;
    const response = await axios.get(`${coinosUrl}/api/invoice/${paymentHash}`, {
      headers: coinosApiKey ? { Authorization: `Bearer ${coinosApiKey}` } : {},
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'cannot check payment' });
  }
});

// Helpers used by the WebSocket handlers
const checkPaid = (data) =>
  data.state === 'paid' ||
  data.state === 'settled' ||
  data.state === 'complete' ||
  data.status === 'paid' ||
  data.status === 'settled' ||
  data.settled ||
  data.paid ||
  data.paid_at ||
  data.settled_at;

// Save donation information
app.post('/donations', async (req, res) => {
  try {
    const { amount, nostr, twitter, instagram, nickname, message, date } = req.body;
    await pool.query(
      'INSERT INTO donations(amount, nostr, twitter, instagram, nickname, message, donated_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [amount, nostr, twitter, instagram, nickname, message, date]
    );
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'cannot save donation' });
  }
});

// Return donations ranked by amount
app.get('/donations', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT amount, nostr, twitter, instagram, nickname, message, donated_at FROM donations ORDER BY amount DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'cannot fetch donations' });
  }
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const match = req.url.match(/^\/invoice\/(.+)\/ws$/);
  if (!match) {
    ws.close();
    return;
  }
  const paymentHash = match[1];
  const headers = coinosApiKey ? { Authorization: `Bearer ${coinosApiKey}` } : {};

  const interval = setInterval(async () => {
    try {
      const { data } = await axios.get(`${coinosUrl}/api/invoice/${paymentHash}`, { headers });
      ws.send(JSON.stringify(data));
      if (checkPaid(data)) {
        clearInterval(interval);
        ws.close();
      }
    } catch (err) {
      ws.send(JSON.stringify({ error: 'cannot check payment' }));
    }
  }, 2000);

  ws.on('close', () => clearInterval(interval));
});

server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
