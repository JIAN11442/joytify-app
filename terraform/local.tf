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
  secret_name               = "MERN_JOYTIFY_ENVS"
  secret_data               = jsondecode(data.aws_secretsmanager_secret_version.joytify.secret_string)
  mongodb_connection_string = local.secret_data["MONGODB_CONNECTION_STRING"]
  discord_webhook_url       = local.secret_data["DISCORD_WEBHOOK_URL"]
  discord_timezone          = local.secret_data["DISCORD_TIMEZONE"]

  # ========================================
  # SCHEDULING CONFIGURATION
  # ========================================
  # Schedule mode: "test_auto" or "production"
  schedule_mode = try(local.secret_data["SCHEDULE_MODE"], "production")

  # Schedule expressions for different modes
  test_auto_schedule  = "rate(5 minutes)"   # 測試用自動觸發每5分鐘
  production_schedule = "cron(0 2 1 * ? *)" # 生產用每月1號凌晨2點 (UTC)

  # Optional weekly cleanup schedule
  weekly_cleanup_schedule = "cron(0 4 ? * 2 *)" # 每週一凌晨4點清理 (UTC)

  # ========================================
  # LAMBDA CONFIGURATION
  # ========================================
  # Monthly Stats Lambda (notification generation only)
  monthly_stats_timeout_seconds = 300                    # 5 minutes - reduced since no cleanup
  monthly_stats_memory_size_mb  = var.lambda_memory_size # Use default Lambda memory size

  # Playback Data Cleanup Lambda
  playback_cleanup_timeout_seconds = 900                    # 15 minutes for cleanup operations
  playback_cleanup_memory_size_mb  = var.lambda_memory_size # Use default Lambda memory size

  # Database configuration
  db_name      = "mern-joytify"
  test_db_name = "mern-joytify-test"

  # Data cleanup settings
  cleanup_days = 60 # Keep 60 days of playback data

  # Batch processing settings
  cleanup_batch_size             = 10000 # Records per batch
  cleanup_batch_delay_ms         = 100   # Delay between batches (ms)
  cleanup_timeout_safety_minutes = 14    # Stop processing before Lambda timeout (minutes)

  # ========================================
  # MONITORING CONFIGURATION
  # ========================================
  cloudwatch_log_retention_days = var.cloudwatch_log_retention_days

  # ========================================
  # SCHEDULE CONFIGURATION
  # ========================================
  # Select schedule expression based on mode
  monthly_stats_schedule_expression = local.schedule_mode == "test_auto" ? local.test_auto_schedule : local.production_schedule
}

