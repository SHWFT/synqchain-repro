# SynqChain MVP

Supply Chain Management Platform - Production-Ready MVP

## Overview

SynqChain is a modern supply chain management platform that transforms a single-page Tailwind + JS + Chart.js demo into a production-ready MVP with:

- **Backend**: TypeScript + NestJS with Prisma ORM
- **Database**: PostgreSQL 
- **Frontend**: Modular JavaScript with preserved UI/UX
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: Local development, Azure Blob for production
- **DevOps**: Docker for local development, Terraform for Azure deployment

## Quick Start

### Prerequisites

- Node.js 20+ LTS
- Docker and Docker Compose
- npm or pnpm

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd synqchain-mvp
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .ENV-EXAMPLE .env
   # Edit .env with your settings
   ```

3. **Start Database**
   ```bash
   cd docker
   docker-compose up -d
   ```

4. **Initialize Database**
   ```bash
   cd apps/api
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Start Development Servers**
   ```bash
   # In project root
   npm run dev
   ```

   This starts:
   - API server on http://localhost:4000
   - Web server on http://localhost:5173

6. **Access Application**
   - Open http://localhost:5173
   - Login with: demo@demo.com / demo

## Application Features

### Core Functionality
- **Dashboard**: Real-time KPIs and analytics
- **Projects**: CRUD operations with status tracking
- **Suppliers**: Supplier management and search
- **Purchase Orders**: Full PO lifecycle with approvals
- **Analytics**: Charts and reporting with Chart.js
- **File Uploads**: Document attachments for POs/Projects/Suppliers

### API Endpoints

#### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user (dev only)
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

#### Core Resources
- `GET/POST /suppliers` - List/Create suppliers
- `GET/PUT/DELETE /suppliers/:id` - Read/Update/Delete supplier
- `GET/POST /projects` - List/Create projects  
- `GET/PUT/DELETE /projects/:id` - Read/Update/Delete project
- `GET/POST /po` - List/Create purchase orders
- `GET/PUT/DELETE /po/:id` - Read/Update/Delete PO
- `POST /po/:id/submit` - Submit PO for approval
- `POST /po/:id/approve` - Approve PO
- `GET /po/:id/events` - Get PO event history

#### Analytics & Files
- `GET /analytics/kpis` - Get KPI data for charts
- `POST /files/upload` - Upload file attachment
- `GET /files/:id` - Download file
- `DELETE /files/:id` - Delete file

#### Health Check
- `GET /healthz` - System health status

## Database Schema

Multi-tenant design with:
- **Tenants**: Company/organization isolation
- **Users**: Authentication with roles (USER, APPROVER, ADMIN)
- **Suppliers**: Vendor management
- **Projects**: Project tracking with savings targets
- **PurchaseOrders**: PO lifecycle management
- **POEvents**: Audit trail for PO changes
- **Files**: Document attachments

## Frontend Architecture

### Modular JavaScript Structure
```
apps/web/src/js/
├── api.js           # API client with fetch wrapper
├── auth.js          # Authentication functions
├── navigation.js    # Navigation management
├── suppliers.js     # Supplier operations
├── projects.js      # Project operations
├── po.js           # Purchase order operations
├── files.js        # File upload/download
├── analytics.js    # Analytics data fetching
├── app.js          # Main application entry
└── pages/          # Page-specific modules
    ├── dashboard.js
    ├── projects.js
    ├── suppliers.js
    ├── po.js
    ├── analytics.js
    └── ...
```

### Key Improvements
- ✅ Removed all inline `onclick` handlers
- ✅ Modular ES6 imports/exports
- ✅ Centralized navigation logic
- ✅ API integration with real data
- ✅ Error handling and loading states
- ✅ Preserved existing UI/UX

## Development Scripts

```bash
# Root level
npm run dev          # Start both API and web servers
npm run dev:api      # Start API server only  
npm run dev:web      # Start web server only
npm run build        # Build both applications
npm run test         # Run tests

# API specific (from apps/api/)
npm run start:dev    # Start with hot reload
npm run prisma:migrate    # Run database migrations
npm run prisma:seed       # Seed database with demo data
npm run prisma:generate   # Generate Prisma client

# Web specific (from apps/web/)
npm run dev          # Start Vite dev server
npm run build        # Build for production
```

## Docker Setup

The Docker setup includes:
- PostgreSQL 16 database
- Health checks and data persistence
- Development-focused configuration

```bash
cd docker
docker-compose up -d      # Start database
docker-compose down       # Stop and remove containers
docker-compose logs       # View logs
```

## Production Deployment

### Azure Terraform (Coming Soon)

```bash
cd infra/terraform/envs/dev
terraform init
terraform plan
terraform apply
```

Infrastructure includes:
- Azure Database for PostgreSQL Flexible Server
- Azure Storage Account for file uploads
- Azure App Insights for monitoring  
- Azure Key Vault for secrets
- Container Apps or App Service for API hosting

## Authentication & Security

- JWT tokens in HTTP-only cookies
- Password hashing with bcryptjs
- CORS configuration for local development
- Request validation with class-validator
- Multi-tenant data isolation

## Monitoring & Observability

- Health check endpoint at `/healthz`
- Request logging with structured output
- Database connection monitoring
- Error tracking and reporting

## File Storage

**Development**: Local filesystem in `./data/files/`
**Production**: Azure Blob Storage with signed URLs

## Testing

### API Tests
```bash
cd apps/api
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:cov    # Coverage report
```

### Frontend Testing
Browser-based testing with preserved UI behavior validation.

## Migration Guide

This refactor preserves:
- ✅ All existing HTML structure and IDs
- ✅ Tailwind CSS classes and styling  
- ✅ Chart.js integration and chart types
- ✅ Navigation behavior and active states
- ✅ Modal and dropdown functionality
- ✅ Responsive design and layouts

## Contributing

1. Follow the established patterns for new modules
2. Maintain backward compatibility with existing UI
3. Add proper error handling and loading states
4. Update tests for any new functionality
5. Use TypeScript for all new API code

## Support

For development questions or issues:
- Check the API health at http://localhost:4000/healthz
- Review browser console for frontend errors
- Check Docker logs for database issues
- Verify environment variables are set correctly

---

**Demo Credentials**: demo@demo.com / demo