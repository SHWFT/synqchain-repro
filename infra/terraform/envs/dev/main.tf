# SynqChain MVP - Azure Infrastructure (Development)
terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-synqchain-dev"
  location = var.location

  tags = var.common_tags
}

# PostgreSQL Flexible Server
module "postgres" {
  source = "../../modules/postgres"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  environment        = "dev"
  
  # Database configuration
  postgres_version    = "16"
  sku_name           = "B_Standard_B1ms"  # Burstable tier for dev
  storage_mb         = 32768               # 32GB
  backup_retention_days = 7
  
  # Authentication
  admin_username = var.postgres_admin_username
  admin_password = var.postgres_admin_password
  
  tags = var.common_tags
}

# Storage Account for file uploads
module "storage" {
  source = "../../modules/storage"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  environment        = "dev"
  
  tags = var.common_tags
}

# Key Vault for secrets
module "key_vault" {
  source = "../../modules/key_vault"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  environment        = "dev"
  
  tags = var.common_tags
}

# Application Insights
module "app_insights" {
  source = "../../modules/app_insights"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  environment        = "dev"
  
  tags = var.common_tags
}

# Container Apps Environment (for hosting the API)
module "container_apps" {
  source = "../../modules/container_apps"
  
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  environment        = "dev"
  
  # Dependencies
  postgres_connection_string = module.postgres.connection_string
  storage_account_name      = module.storage.account_name
  storage_account_key       = module.storage.account_key
  app_insights_key          = module.app_insights.instrumentation_key
  
  tags = var.common_tags
}
