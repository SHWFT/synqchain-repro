# Application Insights Module
resource "azurerm_application_insights" "main" {
  name                = "appi-synqchain-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  application_type    = "web"

  tags = var.tags
}
