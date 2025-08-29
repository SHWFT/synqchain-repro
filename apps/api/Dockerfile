# Multi-stage build for NestJS API
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package files and source
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/api/tsconfig*.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY apps/api/src ./apps/api/src
COPY apps/api/prisma ./apps/api/prisma

# Build the application
WORKDIR /app/apps/api
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy the built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./root_node_modules

# Copy package.json for scripts
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package*.json ./

# Create data directory for file uploads
RUN mkdir -p /app/data/files && chown -R nestjs:nodejs /app/data

USER nestjs

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV API_PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["node", "dist/main.js"]
