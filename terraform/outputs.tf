output "lambda_function_arns" {
  description = "ARNs of deployed Lambda functions"
  value = {
    monthly_stats        = aws_lambda_function.monthly_stats_notification.arn
    discord_notification = aws_lambda_function.discord_notification.arn
    playback_cleanup     = aws_lambda_function.playback_data_cleanup.arn
  }
}

output "lambda_function_names" {
  description = "Names of deployed Lambda functions"
  value = {
    monthly_stats        = aws_lambda_function.monthly_stats_notification.function_name
    discord_notification = aws_lambda_function.discord_notification.function_name
    playback_cleanup     = aws_lambda_function.playback_data_cleanup.function_name
  }
}

output "sns_topic_arn" {
  description = "ARN of the SNS notification topic"
  value       = aws_sns_topic.notification_topic.arn
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value = {
    monthly_stats        = aws_cloudwatch_log_group.monthly_stats_log_group.name
    discord_notification = aws_cloudwatch_log_group.discord_notification_log_group.name
    playback_cleanup     = aws_cloudwatch_log_group.playback_cleanup_log_group.name
  }
}

output "event_schedules" {
  description = "EventBridge schedule configurations"
  value = {
    monthly_stats_schedule  = aws_cloudwatch_event_rule.monthly_stats_schedule.schedule_expression
    weekly_cleanup_schedule = aws_cloudwatch_event_rule.weekly_cleanup_schedule.schedule_expression
    schedule_mode           = local.schedule_mode
    cleanup_days            = local.cleanup_days
    cleanup_batch_size      = local.cleanup_batch_size
    cleanup_batch_delay_ms  = local.cleanup_batch_delay_ms
  }
}