# Azure Key Vault Module - Placeholder
# TODO: Implement Key Vault for production secrets management
resource "azurerm_key_vault" "main" {
  name                = "kv-synqchain-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  tags = var.tags
}

data "azurerm_client_config" "current" {}
