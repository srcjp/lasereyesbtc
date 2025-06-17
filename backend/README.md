# Backend

This directory contains the Express server that provides API endpoints for creating and verifying LNbits invoices.

## Running locally

Install dependencies and start the server:

```bash
npm install
node backendserver.js
```

Set the following environment variables to connect to your LNbits instance:

- `LNBITS_URL` – base URL of the LNbits server
- `LNBITS_INVOICE_KEY` – invoice/read key
- `LNBITS_ADMIN_KEY` – admin key for verifying payments

The server listens on `PORT` (default 3000) and exposes `/invoice` endpoints.
