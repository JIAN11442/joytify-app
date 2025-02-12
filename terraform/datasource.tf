// zip lambda function
data "archive_file" "stats_lambda_function_zip" {
    type = "zip"
    source_dir = local.stats_src_dir
    output_path = local.stats_output_path
}

data "archive_file" "discord_lambda_function_zip" {
    type = "zip"
    source_dir = local.discord_src_dir
    output_path = local.discord_output_path
}

// lambda assume role policy
data "aws_iam_policy_document" "lambda_assume_role_policy" {
   version = "2012-10-17"

    statement {
      effect = "Allow"

      principals {
        type = "Service"
        identifiers = ["lambda.amazonaws.com"]
      }

      actions = ["sts:AssumeRole"]
    }
}

// lambda role policy
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
      resources = ["${aws_cloudwatch_log_group.lambda_log_group.arn}:*","${aws_cloudwatch_log_group.discord_log_group.arn}:*"]
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
      effect = "Allow"
      actions = ["SNS:Publish"]
      // only allow lambda to publish to this sns topic
      resources = ["${aws_sns_topic.lambda_execution_notification.arn}"]
    }
}

// sns topic policy
data "aws_iam_policy_document" "sns_topic_policy" {
    version = "2012-10-17"

    // allow cloudwatch to publish to sns topic
    # statement {
    #   effect = "Allow"
    #   actions = ["SNS:Publish"]
    #   // principals means who/service can publish to this sns topic
    #   principals {
    #     type = "Service"
    #     identifiers = ["cloudwatch.amazonaws.com"]
    #   }
    #   // only allow this resource(cloudwatch alarm) to publish to this sns topic
    #   resources = ["${aws_sns_topic.lambda_execution_notification.arn}"]

    #   // only allow this resource(cloudwatch alarm) to publish to this sns topic
    #   condition {
    #     test = "ArnEquals"
    #     variable = "aws:SourceArn"
    #     values = ["${aws_cloudwatch_metric_alarm.lambda_initialize_error_alarm.arn}"]
    #   }
    # }

    // allow lambda to publish to sns topic
    statement {
      effect = "Allow"
      actions = ["SNS:Publish"]
      // principals means who/service can publish to this sns topic
      principals {
        type = "AWS"
        identifiers = ["${aws_iam_role.lambda_role.arn}"]
      }
      // only allow this resource(lambda) to publish to this sns topic
      resources = ["${aws_sns_topic.lambda_execution_notification.arn}"]
    }
}

// get mongodb connection string from aws secrets manager
data "aws_secretsmanager_secret" "joytify" {
    name = "MERN_JOYTIFY_ENVS"
}

data "aws_secretsmanager_secret_version" "joytify" {
    secret_id = data.aws_secretsmanager_secret.joytify.id
}


