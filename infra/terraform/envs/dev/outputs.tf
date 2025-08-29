# SynqChain MVP - Development Environment Outputs

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "postgres_server_name" {
  description = "PostgreSQL server name"
  value       = module.postgres.server_name
}

output "postgres_connection_string" {
  description = "PostgreSQL connection string"
  value       = module.postgres.connection_string
  sensitive   = true
}

output "storage_account_name" {
  description = "Storage account name"
  value       = module.storage.account_name
}

output "storage_container_name" {
  description = "Storage container name for file uploads"
  value       = module.storage.container_name
}

output "app_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = module.app_insights.instrumentation_key
  sensitive   = true
}

output "container_app_url" {
  description = "Container App URL for the API"
  value       = module.container_apps.app_url
}
