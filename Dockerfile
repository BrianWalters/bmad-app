FROM node:24-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
RUN npm run build
RUN npx esbuild scripts/create-admin.ts scripts/migrate.ts \
    --bundle --platform=node --format=esm \
    --outdir=dist-scripts --packages=external \
    --alias:@=./src

FROM node:24-alpine AS prod-deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/dist-scripts ./dist-scripts
COPY package.json ./

ENV HOST=0.0.0.0
ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000
CMD ["node", "dist/server/entry.mjs"]
