# SynqChain MVP - Azure Infrastructure

This directory contains Terraform modules and configurations for deploying SynqChain MVP to Azure.

## Structure

```
infra/terraform/
├── modules/              # Reusable Terraform modules
│   ├── postgres/        # Azure PostgreSQL Flexible Server
│   ├── storage/         # Azure Storage Account
│   ├── key_vault/       # Azure Key Vault
│   ├── app_insights/    # Application Insights
│   └── container_apps/  # Azure Container Apps
└── envs/                # Environment-specific configurations
    └── dev/             # Development environment
```

## Prerequisites

1. **Azure CLI** - Install and login
   ```bash
   az login
   az account set --subscription "your-subscription-id"
   ```

2. **Terraform** - Install Terraform 1.0+
   ```bash
   # Using Chocolatey (Windows)
   choco install terraform
   
   # Using Homebrew (macOS)
   brew install terraform
   
   # Or download from https://terraform.io
   ```

3. **Azure Subscription** with appropriate permissions

## Deployment

### Development Environment

1. **Navigate to dev environment**
   ```bash
   cd infra/terraform/envs/dev
   ```

2. **Initialize Terraform**
   ```bash
   terraform init
   ```

3. **Create terraform.tfvars**
   ```bash
   # Create terraform.tfvars file
   postgres_admin_password = "YourSecurePassword123!"
   ```

4. **Plan deployment**
   ```bash
   terraform plan
   ```

5. **Apply infrastructure**
   ```bash
   terraform apply
   ```

6. **Get outputs**
   ```bash
   terraform output
   ```

## Resources Created

### Core Infrastructure
- **Resource Group**: `rg-synqchain-dev`
- **PostgreSQL**: Flexible Server with database
- **Storage Account**: For file uploads
- **Application Insights**: For monitoring

### Security & Secrets
- **Key Vault**: For secret management
- **Firewall Rules**: Database access control

### Compute (Planned)
- **Container Apps**: For hosting the API
- **Container Registry**: For Docker images

## Configuration

### Environment Variables

After deployment, update your application's environment variables:

```bash
# Database
DATABASE_URL="<postgres_connection_string>"

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME="<storage_account_name>"
AZURE_STORAGE_ACCOUNT_KEY="<storage_account_key>"
AZURE_STORAGE_CONTAINER_NAME="files"

# Application Insights
AZURE_APP_INSIGHTS_CONNECTION_STRING="<app_insights_connection_string>"
```

### Database Migration

After infrastructure is deployed:

1. **Update database connection string**
2. **Run migrations**
   ```bash
   cd apps/api
   npm run prisma:deploy
   npm run prisma:seed
   ```

## Costs

Development environment estimated monthly costs:
- PostgreSQL Flexible Server (B1ms): ~$15-30
- Storage Account: ~$1-5
- Application Insights: ~$0-10
- Container Apps: ~$10-20

**Total**: ~$25-65/month

## Security Considerations

### Development
- Public access enabled for PostgreSQL (development only)
- Storage account with private containers
- Application Insights for monitoring

### Production (TODO)
- Private endpoints for database
- Managed identities for authentication
- Network security groups
- Azure Active Directory integration
- Secrets in Key Vault

## Cleanup

To destroy all resources:

```bash
cd infra/terraform/envs/dev
terraform destroy
```

**Warning**: This will permanently delete all data!

## Module Documentation

### PostgreSQL Module
- Creates Azure PostgreSQL Flexible Server
- Configures database and users
- Sets up firewall rules

### Storage Module  
- Creates storage account for file uploads
- Configures containers and access policies

### Container Apps Module (TODO)
- Container Apps Environment
- API container deployment
- Environment variable configuration

## Troubleshooting

### Common Issues

1. **PostgreSQL connection issues**
   - Check firewall rules
   - Verify connection string format
   - Ensure SSL mode is enabled

2. **Storage access issues**
   - Verify account keys
   - Check container permissions

3. **Terraform state issues**
   - Consider using remote state (Azure Storage)
   - Check for state locks

### Support

For infrastructure issues:
1. Check Azure portal for resource status
2. Review Terraform outputs
3. Verify Azure CLI authentication
4. Check subscription permissions

## Next Steps

- [ ] Implement Container Apps deployment
- [ ] Add Azure Active Directory integration
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Implement backup strategies
- [ ] Add monitoring and alerting
