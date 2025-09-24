locals {
  # Source directories
  monthly_stats_src_dir        = "${path.module}/src/monthly-stats-notification"
  discord_notification_src_dir = "${path.module}/src/discord-notification"
  playback_cleanup_src_dir     = "${path.module}/src/playback-data-cleanup"

  # Deployment package outputs
  monthly_stats_output_path        = "${local.monthly_stats_src_dir}.zip"
  discord_notification_output_path = "${local.discord_notification_src_dir}.zip"
  playback_cleanup_output_path     = "${local.playback_cleanup_src_dir}.zip"


  # ========================================
  # SECRETS & ENVIRONMENT VARIABLES
  # ========================================
  secret_name               = "JOYTIFY_LAMBDA_ENVS"
  secret_data               = jsondecode(data.aws_secretsmanager_secret_version.joytify.secret_string)
  mongodb_connection_string = local.secret_data["MONGODB_CONNECTION_STRING"]
  discord_webhook_url       = local.secret_data["DISCORD_WEBHOOK_URL"]
  discord_timezone          = local.secret_data["DISCORD_TIMEZONE"]
  internal_api_key          = local.secret_data["API_INTERNAL_SECRET_KEY"]
  backend_api_url           = local.secret_data["API_DOMAIN"]


  # ========================================
  # SCHEDULING CONFIGURATION
  # ========================================
  monthly_stats_schedule = var.monthly_stats_schedule
  weekly_cleanup_schedule = var.weekly_cleanup_schedule


  # ========================================
  # LAMBDA CONFIGURATION
  # ========================================
  monthly_stats_memory_size_mb  = var.lambda_memory_size
  monthly_stats_timeout_seconds = var.lambda_timeout_seconds

  playback_cleanup_timeout_seconds        = var.lambda_timeout_seconds
  playback_cleanup_memory_size_mb         = var.lambda_memory_size
  playback_cleanup_days                   = var.cleanup_days
  playback_cleanup_batch_size             = var.cleanup_batch_size
  playback_cleanup_batch_delay_ms         = var.cleanup_batch_delay_ms
  playback_cleanup_timeout_safety_minutes = var.cleanup_timeout_safety_minutes

  db_name = "mern-joytify"


  # ========================================
  # MONITORING CONFIGURATION
  # ========================================
  cloudwatch_log_retention_days = var.cloudwatch_log_retention_days
}