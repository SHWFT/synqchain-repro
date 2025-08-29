# SynqChain Infrastructure as Code

This directory contains Terraform configurations for deploying SynqChain MVP to Azure.

## Architecture

The infrastructure includes:

- **Azure Container Apps**: Hosts the NestJS API with auto-scaling
- **PostgreSQL Flexible Server**: Managed database with backup and monitoring
- **Azure Storage**: Blob storage for file uploads and backups
- **Key Vault**: Secure storage for secrets and connection strings
- **Application Insights**: Monitoring, logging, and performance tracking
- **Log Analytics**: Centralized logging for all services

## Directory Structure

```
infra/terraform/
├── modules/
│   ├── postgres/          # PostgreSQL Flexible Server module
│   ├── storage/           # Azure Storage Account module
│   ├── container_apps/    # Azure Container Apps module
│   ├── app_insights/      # Application Insights module
│   └── key_vault/         # Key Vault module
├── envs/
│   ├── dev/              # Development environment
│   └── prod/             # Production environment (template)
└── README.md
```

## Prerequisites

1. **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
2. **Terraform** - [Install Terraform](https://www.terraform.io/downloads.html) (>= 1.5)
3. **Azure Subscription** - With Contributor permissions

## Setup

### 1. Azure Authentication

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your Subscription Name"

# Verify your login
az account show
```

### 2. Backend Storage (One-time setup)

Create Azure Storage for Terraform state:

```bash
# Create resource group for Terraform state
az group create --name terraform-state-rg --location "East US"

# Create storage account (name must be globally unique)
az storage account create \
  --resource-group terraform-state-rg \
  --name terraformstateXXXXX \
  --sku Standard_LRS \
  --encryption-services blob

# Create container for state files
az storage container create \
  --name tfstate \
  --account-name terraformstateXXXXX
```

### 3. Environment Configuration

```bash
# Navigate to the environment directory
cd infra/terraform/envs/dev

# Copy and customize variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Configure backend (create backend.tf)
cat > backend.tf << EOF
terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "terraformstateXXXXX"
    container_name       = "tfstate"
    key                  = "synqchain-dev.tfstate"
  }
}
EOF
```

## Deployment

### Development Environment

```bash
cd infra/terraform/envs/dev

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
```

### Production Environment

```bash
cd infra/terraform/envs/prod

# Copy dev configuration as starting point
cp -r ../dev/* .

# Customize for production
# Edit terraform.tfvars for production settings
# Update backend.tf with production state key

# Initialize and deploy
terraform init
terraform plan
terraform apply
```

## Configuration

### Required Variables

Edit `terraform.tfvars`:

```hcl
# Azure region
location = "East US"

# PostgreSQL admin username
postgres_admin_username = "synqadmin"

# Container image from your registry
api_image = "ghcr.io/your-org/synqchain-api:latest"

# Frontend origin for CORS
web_origin = "https://synqchain-dev.azurestaticapps.net"

# Cookie domain for authentication
cookie_domain = "azurecontainerapps.io"

# IP ranges allowed to access PostgreSQL
allowed_ip_ranges = {
  office = {
    start_ip = "203.0.113.0"
    end_ip   = "203.0.113.255"
  }
}
```

### Environment-Specific Settings

**Development (`envs/dev/`):**

- Smaller instance sizes
- Single-zone deployment
- Relaxed network access
- Shorter backup retention

**Production (`envs/prod/`):**

- High-availability configurations
- Multi-zone deployment
- Restricted network access
- Extended backup retention
- Advanced threat protection

## Outputs

After deployment, Terraform provides:

```bash
# View all outputs
terraform output

# Get specific values
terraform output api_url
terraform output postgres_server_fqdn
terraform output storage_account_name
```

### Key Outputs

- `api_url`: URL of the deployed API
- `postgres_server_fqdn`: Database server address
- `key_vault_name`: Name of Key Vault with secrets
- `storage_account_name`: Storage account for files
- `application_insights_key`: Monitoring instrumentation key

## Secrets Management

Secrets are stored in Azure Key Vault:

```bash
# List secrets
az keyvault secret list --vault-name <key-vault-name>

# Get a secret value
az keyvault secret show --vault-name <key-vault-name> --name postgres-password
```

### Available Secrets

- `postgres-password`: Database admin password
- `jwt-secret`: JWT signing secret
- `storage-key`: Storage account access key

## Monitoring

### Application Insights

Monitor application performance:

```bash
# Get Application Insights details
terraform output application_insights_connection_string
```

### Log Analytics

View centralized logs:

1. Go to Azure Portal
2. Navigate to Log Analytics Workspace
3. Use Kusto queries to analyze logs

## Maintenance

### Database Backups

PostgreSQL Flexible Server includes automatic backups:

- Point-in-time restore capability
- Configurable retention period
- Geo-redundant backups (production)

### Updates

```bash
# Update container image
terraform apply -var="api_image=ghcr.io/your-org/synqchain-api:v1.2.0"

# Update other configurations
# Edit terraform.tfvars and apply
terraform apply
```

### Scaling

```bash
# Scale Container Apps
terraform apply -var="min_replicas=2" -var="max_replicas=20"

# Scale PostgreSQL
terraform apply -var="postgres_sku_name=GP_Standard_D2s_v3"
```

## Disaster Recovery

### Database Recovery

```bash
# List available restore points
az postgres flexible-server backup list \
  --resource-group <rg-name> \
  --name <server-name>

# Restore to point in time
az postgres flexible-server restore \
  --resource-group <rg-name> \
  --name <new-server-name> \
  --source-server <source-server-id> \
  --restore-time "2023-01-01T00:00:00Z"
```

### Storage Recovery

```bash
# List blob snapshots
az storage blob list \
  --container-name files \
  --account-name <storage-account>

# Restore deleted blob (if soft delete enabled)
az storage blob undelete \
  --container-name files \
  --name <blob-name> \
  --account-name <storage-account>
```

## Security

### Network Security

- PostgreSQL uses private endpoints in production
- Storage accounts have network access restrictions
- Container Apps use managed identities

### Access Control

```bash
# Grant access to Key Vault
az keyvault set-policy \
  --name <key-vault-name> \
  --object-id <user-object-id> \
  --secret-permissions get list

# Grant Container App access to storage
az role assignment create \
  --assignee <container-app-identity> \
  --role "Storage Blob Data Contributor" \
  --scope <storage-account-id>
```

## Troubleshooting

### Common Issues

1. **Terraform Backend Access**

   ```bash
   # Ensure you have access to storage account
   az storage account keys list \
     --resource-group terraform-state-rg \
     --account-name terraformstateXXXXX
   ```

2. **Container App Deployment Fails**

   ```bash
   # Check Container App logs
   az containerapp logs show \
     --name <app-name> \
     --resource-group <rg-name>
   ```

3. **Database Connection Issues**

   ```bash
   # Test database connectivity
   psql "postgresql://admin:password@server.postgres.database.azure.com:5432/synqchain?sslmode=require"
   ```

4. **Permission Errors**
   ```bash
   # Check your Azure permissions
   az role assignment list --assignee $(az account show --query id -o tsv)
   ```

### Debugging

```bash
# Enable Terraform debug logging
export TF_LOG=DEBUG
terraform apply

# Validate configuration
terraform validate

# Check state
terraform state list
terraform state show <resource-name>
```

## Cost Optimization

### Development

- Use burstable PostgreSQL instances
- Disable geo-redundant backups
- Use LRS storage replication
- Set appropriate auto-scaling limits

### Production

- Use Reserved Instances for consistent workloads
- Enable Azure Hybrid Benefit if applicable
- Monitor costs with Azure Cost Management
- Implement auto-shutdown for non-production environments

## CI/CD Integration

The infrastructure integrates with GitHub Actions:

```yaml
# In .github/workflows/deploy-dev.yml
- name: Deploy to Azure Container Apps
  uses: azure/container-apps-deploy-action@v1
  with:
    appSourcePath: ${{ github.workspace }}
    containerAppName: synqchain-api-dev
    resourceGroup: ${{ steps.terraform.outputs.resource_group_name }}
```

Required GitHub Secrets:

- `AZURE_CREDENTIALS`: Service principal credentials
- `TERRAFORM_STATE_RG`: Terraform state resource group
- `TERRAFORM_STATE_SA`: Terraform state storage account

## Support

For issues with:

- **Terraform**: Check [Terraform Azure Provider docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- **Azure**: Use `az feedback` or Azure Support
- **Application**: Check Application Insights and Container App logs
