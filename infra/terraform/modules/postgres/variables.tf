variable "server_name" {
  description = "Name of the PostgreSQL server"
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

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"
}

variable "admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "synqadmin"
}

variable "admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Name of the main database"
  type        = string
  default     = "synqchain"
}

variable "sku_name" {
  description = "SKU name for the PostgreSQL server"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "storage_mb" {
  description = "Storage size in MB"
  type        = number
  default     = 32768 # 32GB
}

variable "storage_tier" {
  description = "Storage tier"
  type        = string
  default     = "P6"
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "geo_redundant_backup_enabled" {
  description = "Enable geo-redundant backups"
  type        = bool
  default     = false
}

variable "high_availability_mode" {
  description = "High availability mode"
  type        = string
  default     = "Disabled"
}

variable "availability_zone" {
  description = "Availability zone"
  type        = string
  default     = "1"
}

variable "standby_availability_zone" {
  description = "Standby availability zone for HA"
  type        = string
  default     = "2"
}

variable "delegated_subnet_id" {
  description = "ID of the delegated subnet"
  type        = string
  default     = null
}

variable "private_dns_zone_id" {
  description = "ID of the private DNS zone"
  type        = string
  default     = null
}

variable "maintenance_window" {
  description = "Maintenance window configuration"
  type = object({
    day_of_week  = number
    start_hour   = number
    start_minute = number
  })
  default = {
    day_of_week  = 0 # Sunday
    start_hour   = 3
    start_minute = 0
  }
}

variable "allowed_ip_ranges" {
  description = "Map of allowed IP ranges"
  type = map(object({
    start_ip = string
    end_ip   = string
  }))
  default = {}
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}