include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../module"
}

inputs = {
  environment = "prod"

  # 啟用自動調度，Lambda 函數將按計畫自動執行
  enable_auto_schedule = true

  # 月報統計執行時間：每月1日 2:00 AM UTC
  monthly_stats_schedule = "cron(0 2 1 * ? *)"

  # 數據清理執行時間：每周一 4:00 AM UTC
  weekly_cleanup_schedule = "cron(0 4 ? * 2 *)"

  # Lambda 記憶體大小 (MB)
  lambda_memory_size = 256

  # CloudWatch 日誌保留天數
  cloudwatch_log_retention_days = 7

  # 保持數據天數，超過即符合刪除條件
  cleanup_days = 60

  # 每批次處理的記錄數量
  cleanup_batch_size = 10000

  # 批次間延遲時間 (毫秒)，避免數據庫過載並確保穩定性
  cleanup_batch_delay_ms = 100

  # Lambda 超時前的安全緩衝時間 (分鐘)，預留異常處理時間
  # 因為 lambda 最長執行時間就是 15 分鐘，所以這裡設置為 14 分鐘，保留 1 分鐘緩衝時間來停止 lambda 執行
  cleanup_timeout_safety_minutes = 14

  # 月報統計 Lambda 最大執行時間 (秒)
  monthly_stats_timeout_seconds = 300 # 5 min

  # 數據清理 Lambda 最大執行時間 (秒)
  playback_cleanup_timeout_seconds = 900 # 15 min
}