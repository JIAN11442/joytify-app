// zip lambda function
data "archive_file" "lambda_function_zip" {
    type = "zip"
    source_dir = "${path.module}/src"
    output_path = "${path.module}/src.zip"
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
      resources = ["${aws_cloudwatch_log_group.lambda_log_group.arn}:*"]
    }

    // allow lambda to get secret from aws secrets manager
    statement {
      effect = "Allow"
      actions = [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
      ]
      // only allow lambda access this secret
      resources = [data.aws_secretsmanager_secret_version.joytify.arn]
    }
}

// get mongodb connection string from aws secrets manager
data "aws_secretsmanager_secret" "joytify" {
    name = "MERN_JOYTIFY_ENVS"
}

data "aws_secretsmanager_secret_version" "joytify" {
    secret_id = data.aws_secretsmanager_secret.joytify.id
}


