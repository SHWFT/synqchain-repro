variable "environment_name" {
  description = "Name of the Container Apps environment"
  type        = string
}

variable "api_app_name" {
  description = "Name of the API container app"
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

variable "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace"
  type        = string
}

variable "api_image" {
  description = "Container image for the API"
  type        = string
}

variable "api_port" {
  description = "Port that the API listens on"
  type        = number
  default     = 4000
}

variable "api_cpu" {
  description = "CPU allocation for API container"
  type        = number
  default     = 0.5
}

variable "api_memory" {
  description = "Memory allocation for API container"
  type        = string
  default     = "1Gi"
}

variable "min_replicas" {
  description = "Minimum number of replicas"
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum number of replicas"
  type        = number
  default     = 10
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type = map(object({
    value       = optional(string)
    secret_name = optional(string)
  }))
  default = {}
}

variable "secrets" {
  description = "Secrets for the container app"
  type        = map(string)
  sensitive   = true
  default     = {}
}

variable "custom_domain" {
  description = "Custom domain configuration"
  type = object({
    name           = string
    certificate_id = string
  })
  default = null
}

variable "enable_file_storage" {
  description = "Enable file storage volume"
  type        = bool
  default     = false
}

variable "storage_account_name" {
  description = "Name of the storage account for file storage"
  type        = string
  default     = null
}

variable "file_share_name" {
  description = "Name of the file share"
  type        = string
  default     = "files"
}

variable "storage_access_key" {
  description = "Access key for the storage account"
  type        = string
  sensitive   = true
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}