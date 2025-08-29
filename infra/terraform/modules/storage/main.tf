# Azure Storage Account Module
resource "azurerm_storage_account" "main" {
  name                     = "stsynqchain${var.environment}${random_string.suffix.result}"
  resource_group_name      = var.resource_group_name
  location                = var.location
  account_tier            = "Standard"
  account_replication_type = "LRS"

  tags = var.tags
}

resource "random_string" "suffix" {
  length  = 4
  upper   = false
  special = false
}

resource "azurerm_storage_container" "files" {
  name                  = "files"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}
