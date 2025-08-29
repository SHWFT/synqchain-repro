terraform {
  required_version = ">= 1.5"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.1"
    }
  }
  
  backend "azurerm" {
    # Configure backend in terraform.tfvars or via environment variables
    # resource_group_name  = "terraform-state-rg"
    # storage_account_name = "terraformstateXXXXX"
    # container_name       = "tfstate"
    # key                  = "synqchain-dev.tfstate"
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    
    storage {
      purge_soft_delete_on_destroy = true
    }
    
    key_vault {
      purge_soft_delete_on_destroy = true
      recover_soft_deleted_secrets = true
    }
  }
}

locals {
  environment = "dev"
  project     = "synqchain"
  
  common_tags = {
    Environment   = local.environment
    Project       = local.project
    ManagedBy     = "Terraform"
    CreatedDate   = formatdate("YYYY-MM-DD", timestamp())
  }
  
  # Generate unique suffix for globally unique resources
  unique_suffix = random_string.suffix.result
}

# Random string for unique resource names
resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.project}-${local.environment}-rg"
  location = var.location
  tags     = local.common_tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.project}-${local.environment}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${local.project}-${local.environment}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "web"
  tags                = local.common_tags
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                       = "${local.project}-${local.environment}-kv-${local.unique_suffix}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  purge_protection_enabled   = false

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get",
      "List",
      "Set",
      "Delete",
      "Recover",
      "Backup",
      "Restore",
      "Purge"
    ]
  }

  tags = local.common_tags
}

# Generate secrets
resource "random_password" "postgres_password" {
  length  = 16
  special = true
}

resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

# Store secrets in Key Vault
resource "azurerm_key_vault_secret" "postgres_password" {
  name         = "postgres-password"
  value        = random_password.postgres_password.result
  key_vault_id = azurerm_key_vault.main.id
  depends_on   = [azurerm_key_vault.main]
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = random_password.jwt_secret.result
  key_vault_id = azurerm_key_vault.main.id
  depends_on   = [azurerm_key_vault.main]
}

# Storage Module
module "storage" {
  source = "../../modules/storage"

  storage_account_name    = "${local.project}${local.environment}st${local.unique_suffix}"
  resource_group_name     = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  
  # Development settings
  account_tier                   = "Standard"
  replication_type              = "LRS"
  network_access_default_action = "Allow" # More permissive for dev
  threat_protection_enabled     = false   # Disable to save costs
  
  tags = local.common_tags
}

# PostgreSQL Module
module "postgres" {
  source = "../../modules/postgres"

  server_name         = "${local.project}-${local.environment}-db-${local.unique_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  
  admin_username = var.postgres_admin_username
  admin_password = random_password.postgres_password.result
  
  # Development settings
  sku_name                     = "B_Standard_B1ms" # Burstable for dev
  storage_mb                   = 32768             # 32GB
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  high_availability_mode       = "Disabled"
  
  # Allow access from Azure services and your IP
  allowed_ip_ranges = var.allowed_ip_ranges
  
  tags = local.common_tags
}

# Container Apps Module
module "container_apps" {
  source = "../../modules/container_apps"

  environment_name           = "${local.project}-${local.environment}-env"
  api_app_name              = "${local.project}-${local.environment}-api"
  resource_group_name       = azurerm_resource_group.main.name
  location                  = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  
  api_image = var.api_image
  
  # Development scaling
  min_replicas = 1
  max_replicas = 3
  api_cpu      = 0.5
  api_memory   = "1Gi"
  
  # Environment variables
  environment_variables = {
    NODE_ENV = {
      value = "development"
    }
    API_PORT = {
      value = "4000"
    }
    WEB_ORIGIN = {
      value = var.web_origin
    }
    COOKIE_DOMAIN = {
      value = var.cookie_domain
    }
    FILES_BASE_PATH = {
      value = "/app/data/files"
    }
    APPLICATIONINSIGHTS_CONNECTION_STRING = {
      value = azurerm_application_insights.main.connection_string
    }
  }
  
  # Secrets (referenced from Key Vault)
  secrets = {
    database-url = module.postgres.connection_string
    jwt-secret   = random_password.jwt_secret.result
  }
  
  tags = local.common_tags
}

data "azurerm_client_config" "current" {}