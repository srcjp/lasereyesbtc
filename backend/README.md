# Backend

This directory contains the Express server that creates and verifies invoices using a [Coinos](https://coinos.io) custodial wallet.

## Running locally

Install dependencies and start the server:

```bash
npm install
node backendserver.js
```

Set the following environment variables before starting the server:

- `COINOS_URL` – base URL of your Coinos instance (default `https://coinos.io`)
- `COINOS_API_KEY` – API key or JWT token from Coinos
- `CHARGE_AMOUNT` – amount in satoshis for each invoice (minimum `150`, default `150`)
- `CHARGE_MEMO` – memo to attach to created invoices (default `Laser eyes download`)

The server listens on `PORT` (default 3000) and exposes `/invoice` endpoints.
