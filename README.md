# StockGraphy

The app is now split into a frontend at the project root and a dedicated proxy package under `proxy/`.

```text
StockGraphy/
|-- src/
|-- proxy/
|   |-- server.ts
|   |-- server.js
|   |-- tsconfig.json
|   |-- Dockerfile
|   `-- Dockerfile.dev
|-- Dockerfile.web
|-- Dockerfile.web.dev
|-- docker-compose.yml
|-- docker-compose.dev.yml
|-- nginx.conf
|-- .env
|-- package.json
`-- pnpm-lock.yaml
```

## Local Commands

Start the frontend:

```bash
pnpm dev
```

Start the proxy:

```bash
pnpm dev:proxy
```

Build the frontend:

```bash
pnpm build
```

Build the proxy:

```bash
pnpm build:proxy
```

All frontend and proxy dependencies now live in the single root [`package.json`](./package.json).

## Docker

Production stack:

```bash
docker compose -f docker-compose.yml up --build
```

Development stack:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:

- Web: `http://localhost` in production and `http://localhost:3000` in development
- Proxy: `http://localhost:5000`
- Redis: `localhost:6379`

Make sure `.env` contains a valid `UPSTOX_ACCESS_TOKEN` before starting the proxy.
