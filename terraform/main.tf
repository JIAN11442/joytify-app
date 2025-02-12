# ------------------------------------------------
# CREATE LAMBDA
# ------------------------------------------------

resource "aws_iam_role" "lambda_role" {
    name = "StatsPlaybackLambdaRole"
    assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_role_policy" "lambda_role_policy" {
  name = "StatsPlaybackLambdaRolePolicy"
  role = aws_iam_role.lambda_role.id
  policy = data.aws_iam_policy_document.lambda_role_policy.json
}

resource "aws_lambda_function" "stats_playback" {
    function_name = "StatsUserPlaybackAndStoreInDB"
    role = aws_iam_role.lambda_role.arn
    runtime = "nodejs22.x"
    filename = local.stats_output_path
    handler = "index.handler"
    source_code_hash = data.archive_file.stats_lambda_function_zip.output_base64sha256
    timeout = 15
    memory_size = 512

    environment {
      variables = {
        MONGODB_CONNECTION_STRING = local.mongodb_connection_string
        SNS_TOPIC_ARN = aws_sns_topic.lambda_execution_notification.arn
      }
    }
}

resource "aws_lambda_function" "send_message_to_discord" {
  function_name = "SendLambdaExecutionDetailsToDiscord"
  role = aws_iam_role.lambda_role.arn
  runtime = "nodejs22.x"
  filename = local.discord_output_path
  handler = "index.handler"
  source_code_hash = data.archive_file.discord_lambda_function_zip.output_base64sha256

  environment {
    variables = {
      DISCORD_WEBHOOK_URL = local.discord_webhook_url
      LOG_GROUP_NAME = aws_cloudwatch_log_group.lambda_log_group.name
      DISCORD_TIMEZONE = local.discord_timezone
    }
  }
}

resource "aws_lambda_permission" "allow_stats_playback_lambda_to_be_invoked_by_cloudwatch" {
  statement_id = "AllowCloudwatchInvokeLambda"
  action = "lambda:InvokeFunction"
  principal = "events.amazonaws.com"
  function_name = aws_lambda_function.stats_playback.function_name
  source_arn = aws_cloudwatch_event_rule.event_rule.arn
}


resource "aws_lambda_permission" "allow_discord_lambda_to_be_invoked_by_sns" {
  statement_id = "AllowSNSInvokeLambda"
  action = "lambda:InvokeFunction"
  principal = "sns.amazonaws.com"
  function_name = aws_lambda_function.send_message_to_discord.function_name
  source_arn = aws_sns_topic.lambda_execution_notification.arn
}

# ------------------------------------------------
# CREATE CLOUDWATCH ALARM
# ------------------------------------------------

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name = "/aws/lambda/${aws_lambda_function.stats_playback.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "discord_log_group" {
  name = "/aws/lambda/${aws_lambda_function.send_message_to_discord.function_name}"
  retention_in_days = 7
}

# resource "aws_cloudwatch_metric_alarm" "lambda_initialize_error_alarm" {
#   alarm_name = "LambdaInitializeErrorAlarm"
#   alarm_description = "Alarm when the lambda initialize get ${local.alarm_threshold} error in ${local.alarm_period * local.alarm_evaluation_periods} seconds"
#   metric_name = "Errors"
#   namespace = local.cloudwatch_namespace
#   comparison_operator = "GreaterThanOrEqualToThreshold"
#   evaluation_periods = local.alarm_evaluation_periods
#   period = local.alarm_period
#   statistic = local.alarm_statistic
#   threshold = local.alarm_threshold
#   alarm_actions = [aws_sns_topic.lambda_execution_notification.arn]
#   dimensions = {
#     FunctionName = aws_lambda_function.stats_playback.function_name
#   }
# }

resource "aws_cloudwatch_event_rule" "event_rule" {
    name = "StatsPlaybackEventRule"
    # description = "This event rule will be triggered at 12 noon every day to count the playback history"
    description = "This event rule will be triggered every ${local.stats_period_number} ${local.stats_period_unit} to count the playback history"
    # schedule_expression = "rate(${local.stats_period_number} ${local.stats_period_unit})"
    # schedule_expression = "cron(0 0 * * ? *)" // every day at midnight
    schedule_expression = "cron(0,5,10,15,20,25,30,35,40,45,50 * * * ? *)" // every 5 minutes
}

resource "aws_cloudwatch_event_target" "event_target" {
    rule = aws_cloudwatch_event_rule.event_rule.name
    arn = aws_lambda_function.stats_playback.arn
}

# ------------------------------------------------
# CREATE SNS
# ------------------------------------------------

resource "aws_sns_topic" "lambda_execution_notification" {
  name = "LambdaExecutionNotification"
}

resource "aws_sns_topic_policy" "sns_policy" {
  arn = aws_sns_topic.lambda_execution_notification.arn
  policy = data.aws_iam_policy_document.sns_topic_policy.json
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = aws_sns_topic.lambda_execution_notification.arn
  protocol = "lambda"
  endpoint = aws_lambda_function.send_message_to_discord.arn
}
