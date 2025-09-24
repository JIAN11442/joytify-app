locals {
  project_name   = "joytify-app"
  aws_region     = "ap-northeast-1"
  nodejs_runtime = "nodejs20.x"
}

remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "${local.project_name}-tfstate-bucket"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "${local.project_name}-tfstate-lock-table"
  }
}

generate "providers" {
  path      = "providers.global.tf"
  if_exists = "overwrite_terragrunt"
  contents = templatefile("${get_parent_terragrunt_dir()}/_templates/providers.tf.tpl", {
    aws_region = local.aws_region
  })
}

generate "versions" {
  path      = "versions.global.tf"
  if_exists = "overwrite_terragrunt"
  contents  = templatefile("${get_parent_terragrunt_dir()}/_templates/versions.tf.tpl", {})
}

inputs = {
  project_name   = local.project_name
  nodejs_runtime = local.nodejs_runtime
}