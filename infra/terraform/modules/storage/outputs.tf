output "account_name" { value = azurerm_storage_account.main.name }
output "account_key" { value = azurerm_storage_account.main.primary_access_key; sensitive = true }
output "container_name" { value = azurerm_storage_container.files.name }
