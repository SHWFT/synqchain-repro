# PostgreSQL Module Variables

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
}

variable "admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"
}

variable "sku_name" {
  description = "PostgreSQL SKU name"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "storage_mb" {
  description = "Storage size in MB"
  type        = number
  default     = 32768
}

variable "backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

variable "allow_public_access" {
  description = "Allow public access (dev only)"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
