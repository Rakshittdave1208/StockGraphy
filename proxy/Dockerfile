FROM node:20-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY proxy ./proxy
RUN pnpm build:proxy

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY proxy/server.js ./proxy/server.js
COPY --from=build /app/proxy/dist ./proxy/dist

EXPOSE 5000

CMD ["pnpm", "start:proxy"]
