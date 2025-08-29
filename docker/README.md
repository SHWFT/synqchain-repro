# Docker Configuration for SynqChain MVP

This directory contains Docker configurations for running SynqChain MVP in different environments.

## Files Overview

- `docker-compose.yml` - Base configuration for all environments
- `docker-compose.dev.yml` - Development-specific overrides
- `docker-compose.prod.yml` - Production configuration
- `nginx.conf` - Development Nginx configuration
- `nginx.prod.conf` - Production Nginx configuration with SSL and security headers

## Quick Start

### Development (Local)

```bash
# Start all services for development
npm run docker:dev

# Or manually with hot reload
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Production

```bash
# Build and start production services
npm run docker:prod

# Or manually
docker compose -f docker/docker-compose.prod.yml up -d
```

## Services

### Database (PostgreSQL)

- **Port**: 5432
- **Credentials**: synq/synq (development)
- **Database**: synqchain
- **Health Check**: Built-in pg_isready check
- **Volume**: Persistent data storage

### API (NestJS)

- **Port**: 4000
- **Health Check**: `/healthz` endpoint
- **Environment**: Configurable via environment variables
- **Volume**: File uploads storage
- **Dependencies**: Database must be healthy

### Web (Nginx)

- **Port**: 8080 (dev), 80/443 (prod)
- **Static Files**: Serves frontend assets
- **Proxy**: Routes `/api/*` to API service
- **Security**: Production includes SSL, HSTS, CSP headers

### Development Tools

#### Database Admin (Adminer)

- **Port**: 8081
- **URL**: http://localhost:8081
- **Default Server**: db
- **Purpose**: Database management interface

#### Mail Testing (MailHog)

- **SMTP Port**: 1025
- **Web UI Port**: 8025
- **URL**: http://localhost:8025
- **Purpose**: Email testing and debugging

## Environment Variables

### Development (.env)

```bash
# API Configuration
NODE_ENV=development
API_PORT=4000
JWT_SECRET=your-dev-jwt-secret

# Database
DATABASE_URL=postgresql://synq:synq@db:5432/synqchain?schema=public

# Files
FILES_BASE_PATH=/app/data/files

# CORS
WEB_ORIGIN=http://localhost:5173
COOKIE_DOMAIN=localhost
```

### Production (.env.prod)

```bash
# API Configuration
NODE_ENV=production
API_PORT=4000
JWT_SECRET=${SECURE_JWT_SECRET}

# Database (use Azure PostgreSQL or similar)
DATABASE_URL=${AZURE_POSTGRESQL_CONNECTION_STRING}

# Files
FILES_BASE_PATH=/app/data/files

# CORS
WEB_ORIGIN=https://yourdomain.com
COOKIE_DOMAIN=yourdomain.com

# Database credentials
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=synqchain
```

## Docker Commands

### Basic Operations

```bash
# Build services
npm run docker:build

# Start services
npm run docker:up

# Stop services
npm run docker:down

# View logs
npm run docker:logs

# View specific service logs
docker compose -f docker/docker-compose.yml logs api
```

### Development

```bash
# Start with development overrides
npm run docker:dev

# Rebuild API after changes
docker compose -f docker/docker-compose.yml build api
docker compose -f docker/docker-compose.yml restart api
```

### Production

```bash
# Start production stack
npm run docker:prod

# Scale API service
docker compose -f docker/docker-compose.prod.yml up -d --scale api=3
```

### Maintenance

```bash
# Remove all containers and volumes
docker compose -f docker/docker-compose.yml down -v

# Clean up unused images
docker image prune -f

# View resource usage
docker stats
```

## Networking

All services run on a custom bridge network (`synqchain-network` in production) for isolated communication:

- Database: Internal communication only
- API: Exposed on port 4000, communicates with database
- Web: Exposed on ports 80/443, proxies to API
- Development tools: Exposed on additional ports

## Security Features (Production)

### Nginx Security

- SSL/TLS termination
- HTTP to HTTPS redirect
- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on API endpoints
- Blocked access to sensitive files

### Application Security

- Non-root user in containers
- Health checks for all services
- Resource limits and restart policies
- Secure environment variable handling

## Monitoring

### Health Checks

All services include health checks:

- **Database**: `pg_isready` command
- **API**: HTTP GET to `/healthz` endpoint
- **Web**: Basic HTTP response check

### Logs

```bash
# Follow all logs
docker compose logs -f

# API logs only
docker compose logs -f api

# Database logs
docker compose logs -f db
```

## Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Check what's using port 5432
   netstat -tulpn | grep 5432
   ```

2. **Database connection issues**

   ```bash
   # Check database health
   docker compose exec db pg_isready -U synq -d synqchain
   ```

3. **API not starting**

   ```bash
   # Check API logs
   docker compose logs api

   # Rebuild API container
   docker compose build api --no-cache
   ```

4. **File upload issues**
   ```bash
   # Check volume permissions
   docker compose exec api ls -la /app/data
   ```

### Performance Tuning

For production deployments:

1. **Resource Limits**: Add memory and CPU limits to services
2. **Database Tuning**: Configure PostgreSQL for your workload
3. **Nginx Caching**: Enable caching for static assets
4. **Load Balancing**: Scale API service horizontally

## SSL Configuration (Production)

Place SSL certificates in `docker/ssl/`:

- `cert.pem` - SSL certificate
- `key.pem` - Private key

For Let's Encrypt:

```bash
# Example using certbot
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/ssl/key.pem
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker compose exec db pg_dump -U synq synqchain > backup.sql

# Restore backup
docker compose exec -T db psql -U synq synqchain < backup.sql
```

### File Storage Backup

```bash
# Backup uploaded files
docker cp synqchain_api_prod:/app/data ./data-backup
```

## Development Workflow

1. **Initial Setup**

   ```bash
   npm run docker:dev
   npm run seed
   ```

2. **Code Changes**
   - API: Hot reload enabled with volume mounts
   - Frontend: Use `npm run dev:web` for Vite dev server

3. **Database Changes**

   ```bash
   # Run migrations
   docker compose exec api npm run prisma:migrate

   # Reset database
   docker compose exec api npm run prisma:reset
   ```

4. **Testing**
   ```bash
   # Run tests inside container
   docker compose exec api npm test
   ```
