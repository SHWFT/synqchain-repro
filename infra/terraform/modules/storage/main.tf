terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

resource "azurerm_storage_account" "main" {
  name                     = var.storage_account_name
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = var.account_tier
  account_replication_type = var.replication_type
  account_kind             = "StorageV2"

  # Security settings
  enable_https_traffic_only       = true
  min_tls_version                = "TLS1_2"
  allow_nested_items_to_be_public = false
  
  # Advanced threat protection
  threat_protection_enabled = var.threat_protection_enabled

  # Network access rules
  network_rules {
    default_action             = var.network_access_default_action
    bypass                     = ["AzureServices"]
    ip_rules                   = var.allowed_ip_addresses
    virtual_network_subnet_ids = var.allowed_subnet_ids
  }

  blob_properties {
    # Soft delete for blobs
    delete_retention_policy {
      days = var.blob_soft_delete_days
    }
    
    # Soft delete for containers
    container_delete_retention_policy {
      days = var.container_soft_delete_days
    }

    # Versioning
    versioning_enabled = var.blob_versioning_enabled

    # Change feed
    change_feed_enabled = var.change_feed_enabled
  }

  tags = var.tags
}

# Container for file uploads
resource "azurerm_storage_container" "files" {
  name                  = var.files_container_name
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Container for backups
resource "azurerm_storage_container" "backups" {
  name                  = var.backups_container_name
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Optional: Static website container for frontend
resource "azurerm_storage_container" "web" {
  count                 = var.enable_static_website ? 1 : 0
  name                  = "$web"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# Enable static website if requested
resource "azurerm_storage_account_static_website" "main" {
  count                = var.enable_static_website ? 1 : 0
  storage_account_id   = azurerm_storage_account.main.id
  index_document       = "index.html"
  error_404_document   = "404.html"
}

# Storage account private endpoint (optional)
resource "azurerm_private_endpoint" "storage" {
  count               = var.enable_private_endpoint ? 1 : 0
  name                = "${var.storage_account_name}-pe"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.private_endpoint_subnet_id

  private_service_connection {
    name                           = "${var.storage_account_name}-psc"
    private_connection_resource_id = azurerm_storage_account.main.id
    subresource_names              = ["blob"]
    is_manual_connection           = false
  }

  tags = var.tags
}