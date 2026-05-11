# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN ls -la /app/dist || echo "dist not found"

# Stage 2: run
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 3008
CMD ["node", "dist/main"]
