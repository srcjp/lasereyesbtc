# LaserEyesBTC

This repository contains a simple Angular frontend and Express backend that demonstrates a basic Lightning Network integration. The frontend lets users add "laser eyes" to an uploaded picture while the backend now uses the [Coinos](https://coinos.io) API to create and verify invoices.

```
backend/  - Express server exposing /invoice endpoints
frontend/ - Angular application with the laser editor
```

Both projects include Dockerfiles for containerized builds.

## Running with Docker Compose

The repository provides a `docker-compose.yml` file that builds the frontend and
backend images and launches a PostgreSQL database. To start the entire stack run:

```bash
docker compose up -d
```

The Angular app will be available on port `8080` and the backend API on port
`3000`. Environment variables such as `COINOS_API_KEY` can be passed to
`docker compose` to configure invoice generation.

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
Use the `/donations` endpoint to submit contribution data and retrieve the
ranking of top contributors ordered by amount.

When running locally without Docker, configure PostgreSQL via the following
environment variables (values shown match the compose setup):

- `PGHOST` (`db`)
- `PGPORT` (`5432`)
- `PGUSER` (`postgres`)
- `PGPASSWORD` (`postgres`)
- `PGDATABASE` (`lasereyes`)
