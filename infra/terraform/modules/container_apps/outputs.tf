output "environment_id" {
  description = "ID of the Container Apps environment"
  value       = azurerm_container_app_environment.main.id
}

output "environment_default_domain" {
  description = "Default domain of the Container Apps environment"
  value       = azurerm_container_app_environment.main.default_domain
}

output "api_app_id" {
  description = "ID of the API container app"
  value       = azurerm_container_app.api.id
}

output "api_app_fqdn" {
  description = "FQDN of the API container app"
  value       = azurerm_container_app.api.latest_revision_fqdn
}

output "api_app_url" {
  description = "URL of the API container app"
  value       = "https://${azurerm_container_app.api.latest_revision_fqdn}"
}

output "api_identity_principal_id" {
  description = "Principal ID of the API app's managed identity"
  value       = azurerm_container_app.api.identity[0].principal_id
}