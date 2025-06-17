const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const coinosUrl = process.env.COINOS_URL || 'https://coinos.io';
const coinosApiKey = process.env.COINOS_API_KEY; // JWT or API key
const chargeAmount = parseInt(process.env.CHARGE_AMOUNT || '150'); // sats
const chargeMemo = process.env.CHARGE_MEMO || 'Laser eyes download';

app.post('/invoice', async (req, res) => {
  try {
    const response = await axios.post(
      `${coinosUrl}/invoice`,
      { invoice: { amount: chargeAmount, memo: chargeMemo } },
      {
        headers: {
          Authorization: `Bearer ${coinosApiKey}`,
          'Content-Type': 'application/json',
        },
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
      headers: { Authorization: `Bearer ${coinosApiKey}` },
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'cannot check payment' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
