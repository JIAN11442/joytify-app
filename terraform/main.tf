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
    filename = "src.zip"
    handler = "index.handler"
    source_code_hash = data.archive_file.lambda_function_zip.output_base64sha256

    environment {
      variables = {
        MONGODB_CONNECTION_STRING = local.mongodb_connection_string
        STATS_PERIOD_NUMBER = local.stats_period_number
        STATS_PERIOD_UNIT = local.stats_period_unit
      }
    }
}

resource "aws_lambda_permission" "allow_cloudwatch_invoke_lambda" {
  statement_id = "AllowCloudwatchInvokeLambda"
  action = "lambda:InvokeFunction"
  principal = "events.amazonaws.com"
  function_name = aws_lambda_function.stats_playback.function_name
  source_arn = aws_cloudwatch_event_rule.event_rule.arn
  # depends_on = [ aws_cloudwatch_event_rule.event_rule, aws_lambda_function.stats_playback]
}

# ------------------------------------------------
# CREATE CLOUDWATCH ALARM
# ------------------------------------------------

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name = "/aws/lambda/${aws_lambda_function.stats_playback.function_name}"
  retention_in_days = 7
}

resource "aws_cloudwatch_event_rule" "event_rule" {
    name = "StatsPlaybackEventRule"
    # description = "This event rule will be triggered at 12 noon every day to count the playback history"
    description = "This event rule will be triggered every ${local.stats_period_number} ${local.stats_period_unit} to count the playback history"
    # schedule_expression = "rate(${local.stats_period_number} ${local.stats_period_unit})"
    # schedule_expression = "cron(0 0 * * ? *)" // every day at midnight
    # schedule_expression = "cron(0,10,20,30,40,50 * * * ? *)" // every 10 minutes
}

resource "aws_cloudwatch_event_target" "event_target" {
    rule = aws_cloudwatch_event_rule.event_rule.name
    arn = aws_lambda_function.stats_playback.arn
}

