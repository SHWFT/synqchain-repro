output "storage_account_id" {
  description = "ID of the storage account"
  value       = azurerm_storage_account.main.id
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "primary_blob_endpoint" {
  description = "Primary blob service endpoint"
  value       = azurerm_storage_account.main.primary_blob_endpoint
}

output "primary_access_key" {
  description = "Primary access key for the storage account"
  value       = azurerm_storage_account.main.primary_access_key
  sensitive   = true
}

output "connection_string" {
  description = "Primary connection string for the storage account"
  value       = azurerm_storage_account.main.primary_connection_string
  sensitive   = true
}

output "files_container_name" {
  description = "Name of the files container"
  value       = azurerm_storage_container.files.name
}

output "backups_container_name" {
  description = "Name of the backups container"
  value       = azurerm_storage_container.backups.name
}

output "static_website_url" {
  description = "URL of the static website (if enabled)"
  value       = var.enable_static_website ? azurerm_storage_account.main.primary_web_endpoint : null
}