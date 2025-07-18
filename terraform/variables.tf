variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "nodejs_runtime" {
  description = "Node.js runtime version for Lambda functions"
  type        = string
  default     = "nodejs20.x"
}

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 30
}


variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "joytify"
}

variable "lambda_memory_size" {
  description = "Default Lambda memory size in MB"
  type        = number
  default     = 1024

  validation {
    condition     = var.lambda_memory_size >= 128 && var.lambda_memory_size <= 10240
    error_message = "Lambda memory size must be between 128 and 10240 MB."
  }
}