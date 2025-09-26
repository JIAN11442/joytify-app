# ========================================
# IAM ROLES AND POLICIES
# ========================================

resource "aws_iam_role" "lambda_execution_role" {
  name               = "${var.project_name}-lambda-execution-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Component   = "iam"
  }
}

resource "aws_iam_role_policy" "lambda_execution_policy" {
  name   = "${var.project_name}-lambda-execution-policy"
  role   = aws_iam_role.lambda_execution_role.id
  policy = data.aws_iam_policy_document.lambda_role_policy.json
}

# ========================================
# LAMBDA FUNCTIONS
# ========================================

resource "aws_lambda_function" "monthly_stats_notification" {
  function_name    = "${var.project_name}-${var.environment}-monthly-stats-notification"
  role             = aws_iam_role.lambda_execution_role.arn
  runtime          = var.nodejs_runtime
  filename         = local.monthly_stats_output_path
  handler          = "index.handler"
  source_code_hash = data.archive_file.monthly_stats_lambda_zip.output_base64sha256
  timeout          = local.monthly_stats_timeout_seconds
  memory_size      = local.monthly_stats_memory_size_mb

  environment {
    variables = {
      DB_NAME                      = local.db_name
      MONGODB_URI                  = local.mongodb_connection_string
      SNS_TOPIC_ARN                = aws_sns_topic.notification_topic.arn
      PLAYBACK_CLEANUP_LAMBDA_NAME = aws_lambda_function.playback_data_cleanup.function_name
      API_DOMAIN                   = local.backend_api_url
      API_INTERNAL_SECRET_KEY      = local.internal_api_key
      ENVIRONMENT                  = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Component   = "lambda"
    Function    = "monthly-stats"
  }
}

resource "aws_lambda_function" "discord_notification" {
  function_name    = "${var.project_name}-${var.environment}-discord-notification"
  role             = aws_iam_role.lambda_execution_role.arn
  runtime          = var.nodejs_runtime
  filename         = local.discord_notification_output_path
  handler          = "index.handler"
  source_code_hash = data.archive_file.discord_notification_lambda_zip.output_base64sha256

  environment {
    variables = {
      DISCORD_TIMEZONE    = local.discord_timezone
      DISCORD_WEBHOOK_URL = local.discord_webhook_url
      LOG_GROUP_NAME      = aws_cloudwatch_log_group.monthly_stats_log_group.name
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Component   = "lambda"
    Function    = "discord-notification"
  }
}

resource "aws_lambda_function" "playback_data_cleanup" {
  function_name    = "${var.project_name}-${var.environment}-playback-data-cleanup"
  role             = aws_iam_role.lambda_execution_role.arn
  runtime          = var.nodejs_runtime
  filename         = local.playback_cleanup_output_path
  handler          = "index.handler"
  source_code_hash = data.archive_file.playback_cleanup_lambda_zip.output_base64sha256
  timeout          = local.playback_cleanup_timeout_seconds
  memory_size      = local.playback_cleanup_memory_size_mb

  environment {
    variables = {
      MONGODB_URI                    = local.mongodb_connection_string
      SNS_TOPIC_ARN                  = aws_sns_topic.notification_topic.arn
      CLEANUP_DAYS                   = local.playback_cleanup_days
      CLEANUP_BATCH_SIZE             = local.playback_cleanup_batch_size
      CLEANUP_BATCH_DELAY_MS         = local.playback_cleanup_batch_delay_ms
      CLEANUP_TIMEOUT_SAFETY_MINUTES = local.playback_cleanup_timeout_safety_minutes
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Component   = "lambda"
    Function    = "playback-cleanup"
  }
}

# ========================================
# CLOUDWATCH LOG GROUPS
# ========================================

resource "aws_cloudwatch_log_group" "monthly_stats_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.monthly_stats_notification.function_name}"
  retention_in_days = local.cloudwatch_log_retention_days
}

resource "aws_cloudwatch_log_group" "discord_notification_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.discord_notification.function_name}"
  retention_in_days = local.cloudwatch_log_retention_days
}

resource "aws_cloudwatch_log_group" "playback_cleanup_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.playback_data_cleanup.function_name}"
  retention_in_days = local.cloudwatch_log_retention_days
}


# ========================================
# SNS TOPICS AND SUBSCRIPTIONS
# ========================================

# Main notification topic for execution results
resource "aws_sns_topic" "notification_topic" {
  name = "${var.project_name}-${var.environment}-lambda-notifications"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Component   = "sns"
    Function    = "lambda-notifications"
  }
}

resource "aws_sns_topic_policy" "sns_policy" {
  arn    = aws_sns_topic.notification_topic.arn
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

resource "aws_sns_topic_subscription" "discord_notification_subscription" {
  topic_arn = aws_sns_topic.notification_topic.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.discord_notification.arn
}


# ========================================
# LAMBDA PERMISSIONS
# ========================================

resource "aws_lambda_permission" "allow_monthly_stats_invoke_by_eventbridge" {
  count = var.enable_auto_schedule ? 1 : 0

  statement_id  = "AllowEventBridgeInvokeLambda"
  action        = "lambda:InvokeFunction"
  principal     = "events.amazonaws.com"
  function_name = aws_lambda_function.monthly_stats_notification.function_name
  source_arn    = aws_cloudwatch_event_rule.monthly_stats_schedule[0].arn
}


resource "aws_lambda_permission" "allow_discord_invoke_by_sns" {
  statement_id  = "AllowSNSInvokeDiscordLambda"
  action        = "lambda:InvokeFunction"
  principal     = "sns.amazonaws.com"
  function_name = aws_lambda_function.discord_notification.function_name
  source_arn    = aws_sns_topic.notification_topic.arn
}


resource "aws_lambda_permission" "allow_playback_cleanup_invoke_by_eventbridge" {
  count = var.enable_auto_schedule ? 1 : 0

  statement_id  = "AllowEventBridgeInvokePlaybackCleanupLambda"
  action        = "lambda:InvokeFunction"
  principal     = "events.amazonaws.com"
  function_name = aws_lambda_function.playback_data_cleanup.function_name
  source_arn    = aws_cloudwatch_event_rule.weekly_cleanup_schedule[0].arn
}


# ========================================
# EVENTBRIDGE SCHEDULING
# ========================================

resource "aws_cloudwatch_event_rule" "monthly_stats_schedule" {
  count = var.enable_auto_schedule ? 1 : 0

  name                = "${var.project_name}-${var.environment}-monthly-stats-schedule"
  description         = "Automated monthly statistics generation schedule)"
  schedule_expression = local.monthly_stats_schedule
  state               = "ENABLED"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Component   = "eventbridge"
    Function    = "monthly-stats-schedule"
  }
}

resource "aws_cloudwatch_event_target" "monthly_stats_target" {
  count = var.enable_auto_schedule ? 1 : 0

  rule = aws_cloudwatch_event_rule.monthly_stats_schedule[0].name
  arn  = aws_lambda_function.monthly_stats_notification.arn
}

resource "aws_cloudwatch_event_rule" "weekly_cleanup_schedule" {
  count = var.enable_auto_schedule ? 1 : 0

  name                = "${var.project_name}-${var.environment}-weekly-cleanup-schedule"
  description         = "Weekly playback data cleanup schedule"
  schedule_expression = local.weekly_cleanup_schedule
  state               = "ENABLED"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Component   = "eventbridge"
    Function    = "weekly-cleanup-schedule"
  }
}

resource "aws_cloudwatch_event_target" "weekly_cleanup_target" {
  count = var.enable_auto_schedule ? 1 : 0

  rule = aws_cloudwatch_event_rule.weekly_cleanup_schedule[0].name
  arn  = aws_lambda_function.playback_data_cleanup.arn
}


# ========================================
# CLOUDWATCH ALARMS - Lambda Monitoring
# ========================================

resource "aws_cloudwatch_metric_alarm" "monthly_stats_error_alarm" {
  alarm_name          = "MonthlyStatsErrorAlarm"
  alarm_description   = "Monthly Stats Lambda execution errors detected"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_actions       = [aws_sns_topic.notification_topic.arn]
  dimensions = {
    FunctionName = aws_lambda_function.monthly_stats_notification.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "playback_cleanup_error_alarm" {
  alarm_name          = "PlaybackCleanupErrorAlarm"
  alarm_description   = "Playback Data Cleanup Lambda execution errors detected"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_actions       = [aws_sns_topic.notification_topic.arn]
  dimensions = {
    FunctionName = aws_lambda_function.playback_data_cleanup.function_name
  }
}