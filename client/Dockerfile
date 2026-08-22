# ============================================================
# Dayflow HRMS — Client Dockerfile
# Multi-stage: build with Vite → serve with nginx
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build static assets (output → /app/dist)
RUN npm run build

# Serve with lightweight nginx
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: route all requests to index.html for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
