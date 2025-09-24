# ========================================
# ENVIRONMENT CONFIGURATION
# ========================================

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "joytify"
}

variable "nodejs_runtime" {
  description = "Node.js runtime version for Lambda functions"
  type        = string
  default     = "nodejs20.x"
}

# ========================================
# SCHEDULE CONFIGURATION
# ========================================

variable "enable_auto_schedule" {
  description = "Enable automatic scheduling for Lambda functions"
  type        = bool
  default     = true
}

variable "monthly_stats_schedule" {
  description = "Schedule expression for monthly stats Lambda function"
  type        = string
  default     = "cron(0 2 1 * ? *)"
}

variable "weekly_cleanup_schedule" {
  description = "Schedule expression for weekly cleanup Lambda function"
  type        = string
  default     = "cron(0 4 ? * 2 *)"
}


# ========================================
# LAMBDA CONFIGURATION
# ========================================

variable "lambda_memory_size" {
  description = "Default Lambda memory size in MB"
  type        = number
  default     = 1024

  validation {
    condition     = var.lambda_memory_size >= 128 && var.lambda_memory_size <= 10240
    error_message = "Lambda memory size must be between 128 and 10240 MB."
  }
}

variable "lambda_timeout_seconds" {
  description = "Timeout for monthly stats Lambda function in seconds"
  type        = number
  default     = 600

  validation {
    condition     = var.lambda_timeout_seconds >= 1 && var.lambda_timeout_seconds <= 900
    error_message = "Monthly stats timeout must be between 1 and 900 seconds."
  }
}

variable "cleanup_days" {
  description = "Number of days to keep playback data"
  type        = number
  default     = 60

  validation {
    condition     = var.cleanup_days >= 1 && var.cleanup_days <= 365
    error_message = "Cleanup days must be between 1 and 365."
  }
}

variable "cleanup_batch_size" {
  description = "Number of records to process in each cleanup batch"
  type        = number
  default     = 10000

  validation {
    condition     = var.cleanup_batch_size >= 1 && var.cleanup_batch_size <= 100000
    error_message = "Cleanup batch size must be between 1 and 100000."
  }
}

variable "cleanup_batch_delay_ms" {
  description = "Delay between cleanup batches in milliseconds"
  type        = number
  default     = 100

  validation {
    condition     = var.cleanup_batch_delay_ms >= 0 && var.cleanup_batch_delay_ms <= 5000
    error_message = "Cleanup batch delay must be between 0 and 5000 milliseconds."
  }
}

variable "cleanup_timeout_safety_minutes" {
  description = "Safety margin before Lambda timeout in minutes"
  type        = number
  default     = 14

  validation {
    condition     = var.cleanup_timeout_safety_minutes >= 1 && var.cleanup_timeout_safety_minutes <= 60
    error_message = "Cleanup timeout safety must be between 1 and 60 minutes."
  }
}


# ========================================
# MONITORING CONFIGURATION
# ========================================

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 30
}

