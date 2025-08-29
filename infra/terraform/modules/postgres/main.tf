# PostgreSQL Flexible Server Module
resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-synqchain-${var.environment}"
  resource_group_name = var.resource_group_name
  location           = var.location

  administrator_login    = var.admin_username
  administrator_password = var.admin_password

  sku_name                     = var.sku_name
  version                      = var.postgres_version
  storage_mb                   = var.storage_mb
  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = false

  authentication {
    active_directory_auth_enabled = false
    password_auth_enabled         = true
  }

  high_availability {
    mode = "Disabled"
  }

  tags = var.tags
}

# Database
resource "azurerm_postgresql_flexible_server_database" "synqchain" {
  name      = "synqchain"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Firewall rule to allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Optional: Firewall rule for development access
resource "azurerm_postgresql_flexible_server_firewall_rule" "dev_access" {
  count            = var.allow_public_access ? 1 : 0
  name             = "allow-all"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}
