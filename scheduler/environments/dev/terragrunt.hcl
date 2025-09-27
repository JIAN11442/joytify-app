include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../module"
}

inputs = {
  environment = "dev"

  # 禁用自動調度，僅支持手動觸發
  enable_auto_schedule = false

  # 月報統計執行頻率（開發環境用於測試）
  # 因為我們有設定 enable_auto_schedule = false，所以這裡的設定不會生效
  monthly_stats_schedule = "rate(5 minutes)"

  # 數據清理執行時間：每周一 4:00 AM UTC
  # 因為我們有設定 enable_auto_schedule = false，所以這裡的設定不會生效
  weekly_cleanup_schedule = "cron(0 4 ? * 2 *)"

  # Lambda 記憶體大小 (MB)
  lambda_memory_size = 128

  # CloudWatch 日誌保留天數
  cloudwatch_log_retention_days = 1

  # 保持數據天數，超過即符合刪除條件
  cleanup_days = 1

  # 每批次處理的記錄數量
  cleanup_batch_size = 100

  # 批次間延遲時間 (毫秒)，避免數據庫過載並確保穩定性
  cleanup_batch_delay_ms = 10

  # Lambda 超時前的安全緩衝時間 (分鐘)，預留異常處理時間
  cleanup_timeout_safety_minutes = 1

  # 月報統計 Lambda 最大執行時間 (秒)
  monthly_stats_timeout_seconds = 30

  # 數據清理 Lambda 最大執行時間 (秒)
  playback_cleanup_timeout_seconds = 60
}