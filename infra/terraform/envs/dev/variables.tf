variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "East US"
}

variable "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "synqadmin"
}

variable "api_image" {
  description = "Container image for the API"
  type        = string
  default     = "ghcr.io/your-org/synqchain-api:latest"
}

variable "web_origin" {
  description = "Origin for CORS configuration"
  type        = string
  default     = "https://synqchain-dev.azurestaticapps.net"
}

variable "cookie_domain" {
  description = "Domain for authentication cookies"
  type        = string
  default     = "azurecontainerapps.io"
}

variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access PostgreSQL"
  type = map(object({
    start_ip = string
    end_ip   = string
  }))
  default = {
    # Add your development IP ranges here
    # office = {
    #   start_ip = "203.0.113.0"
    #   end_ip   = "203.0.113.255"
    # }
  }
}