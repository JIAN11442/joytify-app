locals {
    secret_data = jsondecode(data.aws_secretsmanager_secret_version.joytify.secret_string)
    mongodb_connection_string = local.secret_data["MONGODB_CONNECTION_STRING"]
    stats_period_number = local.secret_data["STATS_PERIOD_NUMBER"]
    stats_period_unit = local.secret_data["STATS_PERIOD_UNIT"]
}
