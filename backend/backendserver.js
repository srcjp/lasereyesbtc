const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const lnbitsUrl = process.env.LNBITS_URL; // e.g. https://legend.lnbits.com
const invoiceKey = process.env.LNBITS_INVOICE_KEY; // your invoice/read key
const adminKey = process.env.LNBITS_ADMIN_KEY; // used for payment verification

app.post('/invoice', async (req, res) => {
  try {
    const amount = 100; // 100 satoshis
    const memo = 'Laser eyes download';
    const response = await axios.post(`${lnbitsUrl}/api/v1/payments`, {
      out: false,
      amount,
      memo
    }, {
      headers: {
        'X-Api-Key': invoiceKey,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'invoice creation failed' });
  }
});

app.get('/invoice/:paymentHash', async (req, res) => {
  try {
    const { paymentHash } = req.params;
    const response = await axios.get(`${lnbitsUrl}/api/v1/payments/${paymentHash}`, {
      headers: { 'X-Api-Key': adminKey }
    });
    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'cannot check payment' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));