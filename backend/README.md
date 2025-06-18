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
- `COINOS_USERNAME` – username to bill invoices to (required by some instances)
- `CHARGE_AMOUNT` – amount in satoshis for each invoice (minimum `150`, default `150`)
- `CHARGE_MEMO` – memo to attach to created invoices (default `Laser eyes download`)

The server listens on `PORT` (default 3000) and exposes `/invoice` endpoints.
It also provides `/donations` for posting and retrieving contributor rankings.

### Streaming invoice status

To monitor an invoice until it is paid open a WebSocket connection:

```bash
websocat ws://localhost:3000/invoice/<HASH>/ws
```

The server checks the invoice on Coinos every two seconds and sends the
current invoice JSON. The socket closes once the invoice is paid.

The following database variables configure the PostgreSQL connection (defaults
match the `docker-compose.yml` setup):

- `PGHOST` (default `db`)
- `PGPORT` (default `5432`)
- `PGUSER` (default `postgres`)
- `PGPASSWORD` (default `postgres`)
- `PGDATABASE` (default `lasereyes`)
