# SynqChain MVP

A production-ready procurement and supplier management platform built with TypeScript, NestJS, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- npm or pnpm

### Local Development Setup

```bash
npm i
npm run dev
# app on http://localhost:3000
```

### Default Login

- **Email:** demo@demo.com
- **Password:** demo

## 📚 API Documentation

When running in development mode, comprehensive API documentation is available at:

- **Swagger UI:** http://localhost:4000/docs

The API documentation includes:

- Interactive endpoint testing
- Request/response schemas
- Authentication examples
- Error response formats

## 🏗️ Architecture

### Backend (NestJS API)

- **Framework:** TypeScript + NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with HTTP-only cookies, bcrypt hashing
- **Validation:** class-validator with global exception handling
- **File Storage:** Local disk (dev) with Azure Blob abstraction
- **Rate Limiting:** Configurable throttling on sensitive endpoints
- **Logging:** Structured request/response logging with pino

### Frontend (Web App)

- **Tech Stack:** Vanilla JavaScript (ES6 modules), Tailwind CSS, Chart.js
- **Development:** Vite dev server with hot reload
- **State Management:** Modular approach with centralized navigation
- **API Integration:** Fetch-based client with error handling and loading states
- **Features:** Real-time charts, file uploads with progress, toast notifications

### Database Schema

Multi-tenant design with:

- **Tenants:** Organization isolation
- **Users:** Role-based access (USER, APPROVER, ADMIN)
- **Suppliers:** Contact and category management
- **Projects:** Savings tracking and status management
- **Purchase Orders:** Complete lifecycle with event auditing
- **Files:** Secure uploads with entity association
- **Events:** Full audit trail for all PO transactions

## 🔧 Environment Variables

### Required Variables

```bash
# API Configuration
API_PORT=4000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here

# Database
DATABASE_URL=postgresql://synq:synq@localhost:5432/synqchain?schema=public

# File Storage
FILES_BASE_PATH=./data/files

# CORS & Cookies
WEB_ORIGIN=http://localhost:5173
COOKIE_DOMAIN=localhost
```

### Optional Variables

```bash
# Production Security
COOKIE_DOMAIN=yourdomain.com  # Set for production deployments
```

## 🛠️ Available Scripts

### Root Level

- `pnpm dev` - Start both API and web servers
- `pnpm dev:api` - Start only the API server
- `pnpm dev:web` - Start only the web development server
- `pnpm build` - Build both applications for production
- `pnpm test` - Run all tests
- `pnpm lint` - Run ESLint on all code
- `pnpm typecheck` - TypeScript type checking

### API Specific

```bash
cd apps/api
pnpm prisma:migrate    # Run database migrations
pnpm prisma:seed       # Seed demo data
pnpm prisma:studio     # Open Prisma Studio
pnpm test:e2e          # Run end-to-end tests
```

## 🧪 Testing

### Unit Tests

```bash
pnpm test                 # Run all unit tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # Generate coverage report
```

### End-to-End Tests

```bash
pnpm test:e2e           # API integration tests
pnpm test:e2e:watch     # E2E watch mode
```

### Frontend Smoke Tests

```bash
cd apps/web
pnpm test:smoke         # Basic navigation and auth tests
```

## 📊 Key Features

### Authentication & Security

- ✅ JWT authentication with HTTP-only cookies
- ✅ Rate limiting on sensitive endpoints
- ✅ Password complexity requirements
- ✅ Secure cookie configuration for production
- ✅ Global exception handling with structured errors

### Data Management

- ✅ Multi-tenant architecture
- ✅ Complete CRUD for Suppliers, Projects, and Purchase Orders
- ✅ File upload with progress tracking and validation
- ✅ Event-driven audit trail for all PO changes
- ✅ Real-time analytics with caching

### User Experience

- ✅ Loading states and error handling throughout
- ✅ Toast notifications for user feedback
- ✅ Responsive design with Tailwind CSS
- ✅ Interactive charts with Chart.js
- ✅ File drag-and-drop with progress bars

### Purchase Order Lifecycle

- ✅ Draft → Pending Approval → Approved workflow
- ✅ Event logging with actor tracking
- ✅ Timeline UI showing complete audit trail
- ✅ Status transitions with validation
- ✅ Notes and attachments support

## 🚢 Deployment

### Local Docker

```bash
docker compose up --build
```

### Azure Deployment

Terraform configurations are available in `/infra/terraform/`:

1. **Initialize Terraform:**

   ```bash
   cd infra/terraform/envs/dev
   terraform init
   ```

2. **Plan deployment:**

   ```bash
   terraform plan
   ```

3. **Deploy:**
   ```bash
   terraform apply
   ```

### Infrastructure Components

- **Database:** Azure PostgreSQL Flexible Server
- **Storage:** Azure Blob Storage for file uploads
- **Monitoring:** Azure Application Insights
- **Secrets:** Azure Key Vault for secure configuration
- **Hosting:** Azure Container Apps or App Service

## 🔍 API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration (dev only)
- `GET /auth/me` - Get current user profile
- `POST /auth/logout` - User logout

### Suppliers

- `GET /suppliers` - List suppliers (with search)
- `POST /suppliers` - Create supplier
- `GET /suppliers/:id` - Get supplier details
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

### Projects

- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Purchase Orders

- `GET /po` - List purchase orders
- `POST /po` - Create purchase order
- `GET /po/:id` - Get PO details
- `PUT /po/:id` - Update purchase order
- `POST /po/:id/submit` - Submit for approval
- `POST /po/:id/approve` - Approve purchase order
- `GET /po/:id/events` - Get PO event timeline
- `DELETE /po/:id` - Delete purchase order

### Files

- `POST /files/upload` - Upload file (multipart/form-data)
- `GET /files/:id` - Download file
- `GET /files?entityType=:type&entityId=:id` - List entity files
- `DELETE /files/:id` - Delete file

### Analytics

- `GET /analytics/kpis` - Get dashboard KPIs and chart data
  - Query params: `start` and `end` dates for filtering

### System

- `GET /healthz` - Health check endpoint

## 🛡️ Security Features

- **Authentication:** JWT tokens in HTTP-only cookies
- **Rate Limiting:** Configurable limits on auth endpoints
- **Input Validation:** DTO validation with class-validator
- **CORS:** Configured for specific origins
- **File Upload Security:** Type and size validation
- **Error Handling:** Structured responses without sensitive data leakage
- **Audit Trail:** Complete event logging for compliance

## 🎯 Demo Tenant

The application includes a pre-configured demo tenant with sample data:

- **Tenant:** Demo Organization
- **Admin User:** demo@demo.com / demo
- **Sample Data:** 10 suppliers, 10 projects, 20 purchase orders
- **Event History:** Pre-populated PO events for testing

## 📝 Development Notes

### Code Quality

- **ESLint + Prettier:** Consistent code formatting
- **TypeScript:** Full type safety across the stack
- **Git Hooks:** Pre-commit linting and formatting
- **Testing:** Unit and integration test coverage

### Performance

- **API Caching:** 30-second cache on analytics endpoints
- **Database Optimization:** Indexed queries and efficient relations
- **File Handling:** Streaming for large file operations
- **Frontend:** Lazy loading and modular JavaScript

### Monitoring

- **Request Logging:** Detailed HTTP request/response logging
- **Error Tracking:** Structured error reporting
- **Health Checks:** Automated service health monitoring
- **Performance Metrics:** Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes with tests
4. Run the test suite: `pnpm test`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using TypeScript, NestJS, PostgreSQL, and modern web technologies.**
