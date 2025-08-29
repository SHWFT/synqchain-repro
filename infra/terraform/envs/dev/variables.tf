# SynqChain MVP - Development Environment Variables

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "postgres_admin_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "synqadmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "SynqChain"
    Environment = "development"
    Owner       = "DevTeam"
    Purpose     = "MVP"
  }
}
