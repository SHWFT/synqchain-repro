terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = var.environment_name
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = var.log_analytics_workspace_id

  tags = var.tags
}

# Container App for API
resource "azurerm_container_app" "api" {
  name                         = var.api_app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "api"
      image  = var.api_image
      cpu    = var.api_cpu
      memory = var.api_memory

      dynamic "env" {
        for_each = var.environment_variables
        content {
          name        = env.key
          value       = env.value.value
          secret_name = env.value.secret_name
        }
      }

      liveness_probe {
        transport = "HTTP"
        port      = var.api_port
        path      = "/healthz"
        
        initial_delay_seconds = 30
        period_seconds        = 30
        timeout_seconds       = 5
        failure_threshold     = 3
      }

      readiness_probe {
        transport = "HTTP"
        port      = var.api_port
        path      = "/healthz"
        
        initial_delay_seconds = 5
        period_seconds        = 10
        timeout_seconds       = 3
        failure_threshold     = 3
      }
    }

    # Volume for file storage
    dynamic "volume" {
      for_each = var.enable_file_storage ? [1] : []
      content {
        name         = "file-storage"
        storage_type = "AzureFile"
        storage_name = azurerm_container_app_environment_storage.files[0].name
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = var.api_port
    
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }

    # Custom domain (optional)
    dynamic "custom_domain" {
      for_each = var.custom_domain != null ? [var.custom_domain] : []
      content {
        name           = custom_domain.value.name
        certificate_id = custom_domain.value.certificate_id
      }
    }
  }

  # Secrets for environment variables
  dynamic "secret" {
    for_each = var.secrets
    content {
      name  = secret.key
      value = secret.value
    }
  }

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# File storage for Container Apps (optional)
resource "azurerm_container_app_environment_storage" "files" {
  count                        = var.enable_file_storage ? 1 : 0
  name                         = "file-storage"
  container_app_environment_id = azurerm_container_app_environment.main.id
  account_name                 = var.storage_account_name
  share_name                   = var.file_share_name
  access_key                   = var.storage_access_key
  access_mode                  = "ReadWrite"
}