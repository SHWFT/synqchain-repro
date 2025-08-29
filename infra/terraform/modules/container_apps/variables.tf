variable "resource_group_name" { type = string }
variable "location" { type = string }
variable "environment" { type = string }
variable "postgres_connection_string" { type = string; sensitive = true }
variable "storage_account_name" { type = string }
variable "storage_account_key" { type = string; sensitive = true }
variable "app_insights_key" { type = string; sensitive = true }
variable "tags" { type = map(string); default = {} }
