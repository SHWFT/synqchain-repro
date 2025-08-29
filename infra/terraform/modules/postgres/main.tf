terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = var.server_name
  resource_group_name    = var.resource_group_name
  location              = var.location
  version               = var.postgres_version
  delegated_subnet_id   = var.delegated_subnet_id
  private_dns_zone_id   = var.private_dns_zone_id
  
  administrator_login    = var.admin_username
  administrator_password = var.admin_password
  
  zone = var.availability_zone

  storage_mb   = var.storage_mb
  storage_tier = var.storage_tier

  sku_name = var.sku_name

  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup_enabled

  high_availability {
    mode                      = var.high_availability_mode
    standby_availability_zone = var.standby_availability_zone
  }

  maintenance_window {
    day_of_week  = var.maintenance_window.day_of_week
    start_hour   = var.maintenance_window.start_hour
    start_minute = var.maintenance_window.start_minute
  }

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Optional: Allow specific IP ranges
resource "azurerm_postgresql_flexible_server_firewall_rule" "allowed_ips" {
  for_each = var.allowed_ip_ranges

  name             = each.key
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = each.value.start_ip
  end_ip_address   = each.value.end_ip
}