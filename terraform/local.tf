locals {
    # ========================================
    # SOURCE DIRECTORY PATHS
    # ========================================
    dispatcher_src_dir = "${path.module}/src/dispatcher"
    stats_src_dir = "${path.module}/src/stats"
    discord_src_dir = "${path.module}/src/discord"

    # ========================================
    # LAMBDA PACKAGE OUTPUT PATHS
    # ========================================
    dispatcher_output_path = "${local.dispatcher_src_dir}.zip"
    stats_output_path = "${local.stats_src_dir}.zip"
    discord_output_path = "${local.discord_src_dir}.zip"

    # ========================================
    # SECRETS & ENVIRONMENT VARIABLES
    # ========================================
    secret_data = jsondecode(data.aws_secretsmanager_secret_version.joytify.secret_string)
    mongodb_connection_string = local.secret_data["MONGODB_CONNECTION_STRING"]
    discord_webhook_url = local.secret_data["DISCORD_WEBHOOK_URL"]
    discord_timezone = local.secret_data["DISCORD_TIMEZONE"]

    # ========================================
    # SCHEDULING CONFIGURATION
    # ========================================
    stats_period_number = local.secret_data["STATS_PERIOD_NUMBER"]
    stats_period_unit = local.secret_data["STATS_PERIOD_UNIT"]

    # ========================================
    # LAMBDA PERFORMANCE CONFIGURATION
    # ========================================
    # Dispatcher: How many records each chunk should contain
    dispatcher_chunk_size = 2000
    
    # Stats Executor: Batch processing configuration
    stats_executor_batch_size = 100
    stats_executor_max_concurrent = 15
    
    # Lambda timeout and memory settings
    dispatcher_timeout_seconds = 720
    executor_timeout_seconds = 600
    lambda_memory_size_mb = 512

    # ========================================
    # MONITORING & ALARM CONFIGURATION
    # ========================================
    cloudwatch_namespace = "LambdaInitializeErrorMetric"
    cloudwatch_log_retention_days = 7
    
    # Alarm settings
    alarm_evaluation_periods = 1
    alarm_period_seconds = 60
    alarm_statistic = "Sum"
    alarm_threshold = 1
    
    # ========================================
    # SCHEDULE EXPRESSION
    # ========================================
    # Test: Every 5 minutes for testing
    # Production: Use rate expression based on stats_period_number and stats_period_unit
    schedule_expression_test = "cron(0,5,10,15,20,25,30,35,40,45,50 * * * ? *)"
    schedule_expression_production = "rate(${local.stats_period_number} ${local.stats_period_unit})"
}

