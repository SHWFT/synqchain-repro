# Container Apps Module - Placeholder
# TODO: Implement Container Apps for API hosting
resource "azurerm_container_app_environment" "main" {
  name                = "cae-synqchain-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name

  tags = var.tags
}

# Placeholder for Container App
resource "azurerm_container_app" "api" {
  name                         = "ca-synqchain-api-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode               = "Single"

  template {
    container {
      name   = "synqchain-api"
      image  = "nginx:latest" # Placeholder
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }

  tags = var.tags
}
