# ========================================
# LAMBDA DEPLOYMENT PACKAGES
# ========================================
data "archive_file" "monthly_stats_lambda_zip" {
  type        = "zip"
  source_dir  = local.monthly_stats_src_dir
  output_path = local.monthly_stats_output_path
}

data "archive_file" "discord_notification_lambda_zip" {
  type        = "zip"
  source_dir  = local.discord_notification_src_dir
  output_path = local.discord_notification_output_path
}

data "archive_file" "playback_cleanup_lambda_zip" {
  type        = "zip"
  source_dir  = local.playback_cleanup_src_dir
  output_path = local.playback_cleanup_output_path
}


# ========================================
# LAMBDA ASSUME ROLE POLICY
# ========================================
data "aws_iam_policy_document" "lambda_assume_role_policy" {
  version = "2012-10-17"

  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}


# ========================================
# LAMBDA ROLE POLICY
# ========================================
data "aws_iam_policy_document" "lambda_role_policy" {
  version = "2012-10-17"

  // allow lambda to write logs to cloudwatch
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DeleteLogGroup",
      "logs:DeleteLogStream"
    ]
    // only allow lambda to write logs to this log group
    resources = [
      "${aws_cloudwatch_log_group.monthly_stats_log_group.arn}:*",
      "${aws_cloudwatch_log_group.discord_notification_log_group.arn}:*",
      "${aws_cloudwatch_log_group.playback_cleanup_log_group.arn}:*"
    ]
  }

  // allow lambda to get secret from aws secrets manager
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
    ]
    // only allow lambda to access this secret
    resources = ["${data.aws_secretsmanager_secret_version.joytify.arn}"]
  }

  // allow lambda to publish to sns topic
  statement {
    effect  = "Allow"
    actions = ["SNS:Publish"]
    // only allow lambda to publish to this sns topic
    resources = [
      "${aws_sns_topic.notification_topic.arn}"
    ]
  }

  // allow monthly stats lambda to invoke playback cleanup lambda
  statement {
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      "${aws_lambda_function.playback_data_cleanup.arn}"
    ]
  }

}


# ========================================
# SNS TOPIC POLICY
# ========================================
data "aws_iam_policy_document" "sns_topic_policy" {
  version = "2012-10-17"

  // allow lambda to publish to sns topic
  statement {
    effect  = "Allow"
    actions = ["SNS:Publish"]
    // principals means who/service can publish to this sns topic
    principals {
      type        = "AWS"
      identifiers = ["${aws_iam_role.lambda_execution_role.arn}"]
    }
    // only allow this resource(lambda) to publish to this sns topic
    resources = ["${aws_sns_topic.notification_topic.arn}"]
  }
}


# ========================================
# SECRETS MANAGER
# ========================================
data "aws_secretsmanager_secret" "joytify" {
  name = local.secret_name
}

data "aws_secretsmanager_secret_version" "joytify" {
  secret_id = data.aws_secretsmanager_secret.joytify.id
}

