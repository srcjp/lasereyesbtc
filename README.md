# LaserEyesBTC

This repository contains a simple Angular frontend and Express backend that demonstrates a basic Lightning Network integration. The frontend lets users add "laser eyes" to an uploaded picture while the backend now uses the [Coinos](https://coinos.io) API to create and verify invoices.

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

The server requires the following environment variables:
- `COINOS_URL` – base URL of your Coinos instance (default `https://coinos.io`)
- `COINOS_API_KEY` – API key or JWT token from Coinos
- `CHARGE_AMOUNT` – amount in satoshis per download (minimum `150`, default `150`)
- `CHARGE_MEMO` – memo for the created invoices (default `Laser eyes download`)
- `PORT` (optional) – port to listen on (defaults to 3000)

After starting, the endpoints will be available at `http://localhost:PORT`.
