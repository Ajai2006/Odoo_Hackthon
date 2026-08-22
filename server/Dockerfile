# ============================================================
# Dayflow HRMS — Server Dockerfile
# Multi-stage: deps → production
# ============================================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Seed the database on first run if it doesn't exist
RUN if [ ! -f dayflow.db ]; then node src/db/seed.js; fi

EXPOSE 5000

CMD ["node", "src/server.js"]
