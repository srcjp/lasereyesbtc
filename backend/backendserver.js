const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');

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
      `${coinosUrl}/invoice`,
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
    const response = await axios.get(`${coinosUrl}/invoice/${paymentHash}`, {
      headers: coinosApiKey ? { Authorization: `Bearer ${coinosApiKey}` } : {},
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'cannot check payment' });
  }
});

// Stream invoice status updates using Server-Sent Events
app.get('/invoice/:paymentHash/stream', async (req, res) => {
  const { paymentHash } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const headers = coinosApiKey ? { Authorization: `Bearer ${coinosApiKey}` } : {};

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

  const interval = setInterval(async () => {
    try {
      const response = await axios.get(`${coinosUrl}/invoice/${paymentHash}`, { headers });
      const data = response.data;
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (checkPaid(data)) {
        clearInterval(interval);
        res.end();
      }
    } catch (err) {
      res.write(`event: error\ndata: ${JSON.stringify(err.response?.data || { error: 'cannot check payment' })}\n\n`);
    }
  }, 2000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

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
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
