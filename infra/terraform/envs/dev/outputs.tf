output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "api_url" {
  description = "URL of the API application"
  value       = module.container_apps.api_app_url
}

output "postgres_server_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = module.postgres.server_fqdn
}

output "postgres_database_name" {
  description = "Name of the PostgreSQL database"
  value       = module.postgres.database_name
}

output "storage_account_name" {
  description = "Name of the storage account"
  value       = module.storage.storage_account_name
}

output "files_container_name" {
  description = "Name of the files container"
  value       = module.storage.files_container_name
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "application_insights_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

# Secret references for CD pipeline
output "postgres_password_secret_name" {
  description = "Name of the postgres password secret in Key Vault"
  value       = azurerm_key_vault_secret.postgres_password.name
}

output "jwt_secret_name" {
  description = "Name of the JWT secret in Key Vault"
  value       = azurerm_key_vault_secret.jwt_secret.name
}