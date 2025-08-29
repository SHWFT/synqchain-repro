variable "storage_account_name" {
  description = "Name of the storage account (must be globally unique)"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region location"
  type        = string
}

variable "account_tier" {
  description = "Storage account tier"
  type        = string
  default     = "Standard"
}

variable "replication_type" {
  description = "Storage account replication type"
  type        = string
  default     = "LRS"
}

variable "files_container_name" {
  description = "Name of the container for file uploads"
  type        = string
  default     = "files"
}

variable "backups_container_name" {
  description = "Name of the container for backups"
  type        = string
  default     = "backups"
}

variable "blob_soft_delete_days" {
  description = "Number of days to retain soft-deleted blobs"
  type        = number
  default     = 7
}

variable "container_soft_delete_days" {
  description = "Number of days to retain soft-deleted containers"
  type        = number
  default     = 7
}

variable "blob_versioning_enabled" {
  description = "Enable blob versioning"
  type        = bool
  default     = false
}

variable "change_feed_enabled" {
  description = "Enable blob change feed"
  type        = bool
  default     = false
}

variable "threat_protection_enabled" {
  description = "Enable advanced threat protection"
  type        = bool
  default     = true
}

variable "network_access_default_action" {
  description = "Default action for network access rules"
  type        = string
  default     = "Deny"
}

variable "allowed_ip_addresses" {
  description = "List of allowed IP addresses"
  type        = list(string)
  default     = []
}

variable "allowed_subnet_ids" {
  description = "List of allowed subnet IDs"
  type        = list(string)
  default     = []
}

variable "enable_static_website" {
  description = "Enable static website hosting"
  type        = bool
  default     = false
}

variable "enable_private_endpoint" {
  description = "Enable private endpoint"
  type        = bool
  default     = false
}

variable "private_endpoint_subnet_id" {
  description = "Subnet ID for private endpoint"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}