output "app_url" { value = "https://${azurerm_container_app.api.latest_revision_fqdn}" }
