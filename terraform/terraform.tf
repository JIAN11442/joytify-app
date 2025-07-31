terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket         = "joytify-tfstate-bucket-yj"
    key            = "terraform/state.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "joytify-tfstate-lock-table"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "Joytify"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Service     = "data-processing"
    }
  }
}