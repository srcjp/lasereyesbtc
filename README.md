# LaserEyesBTC

This repository contains a simple Angular frontend and Express backend that demonstrates a basic Lightning Network integration. The frontend lets users add "laser eyes" to an uploaded picture while the backend provides endpoints for creating and checking LNbits invoices.

```
backend/  - Express server exposing /invoice endpoints
frontend/ - Angular application with the laser editor
```

Both projects include Dockerfiles for containerized builds.

## Starting the backend

To run the API locally:

```bash
cd backend
npm install
node backendserver.js
```

The server requires the following environment variables to be defined:

- `LNBITS_URL` – base URL of your LNbits instance
- `LNBITS_INVOICE_KEY` – invoice/read key
- `LNBITS_ADMIN_KEY` – admin key used to verify payments
- `PORT` (optional) – port to listen on (defaults to 3000)

After starting, the endpoints will be available at `http://localhost:PORT`.
