# StockGraphy

StockGraphy is a market dashboard with:

- a Vite + React frontend in the project root
- an Express proxy server in `proxy/`
- Redis for caching and realtime support in containerized setups

## Project Structure

```text
StockGraphy/
|-- src/                  # Frontend app
|-- public/               # Static assets
|-- proxy/                # Backend proxy server
|-- Dockerfile.web        # Production frontend image
|-- Dockerfile.web.dev    # Development frontend image
|-- docker-compose.yml    # Production-like Docker stack
|-- docker-compose.dev.yml# Development Docker stack
|-- nginx.conf            # Nginx config for production web image
|-- .env.example          # Sample environment variables
|-- package.json          # Main scripts and dependencies
`-- README.md
```

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Express
- Redis
- Docker Compose

## Before You Start

You do not need Docker to run the project locally.

Use normal local development if you just want to work on the app:

- frontend on `http://localhost:3000`
- proxy on `http://localhost:5000`
- Redis on `localhost:6379` if you run it separately

Use Docker only if you want the full stack started together in containers.

## Requirements

- Node.js 20+ recommended
- pnpm recommended
- Docker Desktop only if you want to use Docker

## Environment Setup

Create a local `.env` file from `.env.example`.

```bash
cp .env.example .env
```

If you are on Windows PowerShell, you can also do:

```powershell
Copy-Item .env.example .env
```

Current environment variables:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379
VITE_PROXY_TARGET=http://localhost:5000

UPSTOX_API_KEY=your-upstox-api-key
UPSTOX_API_SECRET=your-upstox-api-secret
UPSTOX_ACCESS_TOKEN=your-upstox-access-token
```

Important:

- `VITE_PROXY_TARGET` is used by the frontend to call the proxy
- `UPSTOX_ACCESS_TOKEN` must be valid for the proxy to access market data
- `.env.example` is safe to commit, but `.env` should stay local

## Install Dependencies

```bash
pnpm install
```

## Local Development

Run the frontend:

```bash
pnpm dev
```

Run the proxy in another terminal:

```bash
pnpm dev:proxy
```

Useful scripts:

- `pnpm dev` starts the frontend dev server
- `pnpm dev:proxy` starts the proxy with `tsx`
- `pnpm build` builds the frontend
- `pnpm build:proxy` builds the proxy TypeScript output
- `pnpm check:proxy` runs a no-emit TypeScript check for the proxy
- `pnpm lint` runs ESLint
- `pnpm preview` previews the built frontend locally
- `pnpm start:proxy` runs the compiled proxy output

## Docker Guide

If Docker feels confusing, think of it like this:

- `Dockerfile` describes how to build one container image
- `docker-compose.yml` describes how multiple containers run together
- this project uses separate containers for the web app, proxy, and Redis

### Production-like Docker Stack

This uses:

- `Dockerfile.web`
- `proxy/Dockerfile`
- `docker-compose.yml`

Start it with:

```bash
docker compose -f docker-compose.yml up --build
```

Services:

- web: `http://localhost`
- proxy: `http://localhost:5000`
- redis: `localhost:6379`

### Development Docker Stack

This uses:

- `Dockerfile.web.dev`
- `proxy/Dockerfile.dev`
- `docker-compose.dev.yml`

Start it with:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:

- web: `http://localhost:3000`
- proxy: `http://localhost:5000`
- redis: `localhost:6379`

This setup mounts your local files into the containers, so code changes can reflect during development.

## Which Option Should You Use?

Use local development if:

- you are actively coding
- you want the simplest setup
- you do not need Docker yet

Use Docker if:

- you want the full stack started with one command
- you want a more production-like environment
- Redis is easier for you to run through Docker than locally

## Git Ignore vs Docker Ignore

These two files do different jobs:

- `.gitignore` tells Git which files should not be committed
- `.dockerignore` tells Docker which files should not be copied into the image build context

Example:

- `node_modules/` should usually be ignored by both
- `.env` should not be committed, and usually should not be copied into an image unless intentionally needed

## Notes

- The frontend, proxy, and Docker files all live in the same repo
- The main app dependencies are managed from the root `package.json`
- The `proxy/` folder contains the backend server code and Dockerfiles for the proxy

## Troubleshooting

If the frontend starts but data does not load:

- check that the proxy is running
- check that `VITE_PROXY_TARGET` points to the correct proxy URL
- check that your Upstox credentials in `.env` are valid

If Docker starts but the app cannot connect:

- confirm Docker Desktop is running
- confirm the `.env` file exists before starting compose
- confirm ports `3000`, `5000`, and `6379` are not already in use

If PowerShell blocks `npm` or `pnpm` scripts:

- use `cmd /c <command>` as a workaround
- or adjust your local PowerShell execution policy if you know you want that behavior
