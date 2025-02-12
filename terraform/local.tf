locals {
    stats_src_dir = "${path.module}/src/stats"
    discord_src_dir = "${path.module}/src/discord"
    stats_output_path = "${local.stats_src_dir}.zip"
    discord_output_path = "${local.discord_src_dir}.zip"

    secret_data = jsondecode(data.aws_secretsmanager_secret_version.joytify.secret_string)
    mongodb_connection_string = local.secret_data["MONGODB_CONNECTION_STRING"]
    stats_period_number = local.secret_data["STATS_PERIOD_NUMBER"]
    stats_period_unit = local.secret_data["STATS_PERIOD_UNIT"]
    discord_webhook_url = local.secret_data["DISCORD_WEBHOOK_URL"]
    discord_timezone = local.secret_data["DISCORD_TIMEZONE"]

    cloudwatch_namespace = "LambdaInitializeErrorMetric"

    alarm_evaluation_periods = 1
    alarm_period = 60
    alarm_statistic = "Sum"
    alarm_threshold = 1
}

