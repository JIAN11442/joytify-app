import { MongoClient } from "mongodb";
import AWS from "aws-sdk";
import { cleanupOldPlaybackData, determineCleanupModeFromEvent } from "./service.js";

const sns = new AWS.SNS();

// MongoDB 連接配置
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "mern-joytify";
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

const handler = async (event) => {
  const startTime = Date.now();
  let client;

  // 檢查是否為測試模式
  const { testMode } = determineCleanupModeFromEvent(event);
  console.log(`🚀 Playback Data Cleanup Lambda started${testMode ? " (TEST MODE)" : ""}`);

  try {
    // 1. 連接 MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    console.log("========== PART 2.1: 初始化 ==========");
    console.log("✅ Connected to MongoDB");

    // 2. 獲取清理配置
    const cleanupDays = parseInt(process.env.CLEANUP_DAYS || "60");
    const cutoffDate = new Date(Date.now() - cleanupDays * 24 * 60 * 60 * 1000);

    console.log("========== PART 2.2: 數據清理 ==========");
    console.log(`🗑️ Cleaning up data older than ${cutoffDate.toISOString()}`);

    // 3. 執行數據清理
    const cleanupResult = await cleanupOldPlaybackData(testMode);
    console.log(`🧹 Cleanup completed: ${cleanupResult.recordsDeleted} records deleted`);

    console.log("========== PART 2.3: 結果統計 ==========");

    const executionTime = Date.now() - startTime;

    // 4. 發送執行結果到 SNS
    const summaryMessage = {
      source: "playback-data-cleanup",
      type: "cleanup_summary",
      data: {
        recordsDeleted: cleanupResult.recordsDeleted,
        totalRecordsFound: cleanupResult.totalRecordsFound,
        remainingRecords: cleanupResult.remainingRecords,
        completionPercentage: cleanupResult.completionPercentage,
        wasTimeoutStopped: cleanupResult.wasTimeoutStopped,
        processingMode: cleanupResult.processingMode,
        batchSize: cleanupResult.batchSize,
        cutoffDate: cleanupResult.cutoffDate,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
        testMode: testMode,
        triggeredBy: event.triggeredBy || "manual",
      },
    };

    if (SNS_TOPIC_ARN) {
      await sns
        .publish({
          TopicArn: SNS_TOPIC_ARN,
          Message: JSON.stringify(summaryMessage),
        })
        .promise();

      console.log("📡 Summary sent to SNS");
    }

    console.log(`🎉 Playback Data Cleanup Lambda completed successfully in ${executionTime}ms`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        summary: summaryMessage.data,
      }),
    };
  } catch (error) {
    console.error("❌ Playback Data Cleanup Lambda failed:", error);

    // 發送錯誤通知
    if (SNS_TOPIC_ARN) {
      try {
        await sns
          .publish({
            TopicArn: SNS_TOPIC_ARN,
            Message: JSON.stringify({
              source: "playback-data-cleanup",
              type: "cleanup_error",
              data: {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                testMode: testMode,
              },
            }),
          })
          .promise();
      } catch (snsError) {
        console.error("Failed to send error notification:", snsError);
      }
    }

    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 MongoDB connection closed");
    }
  }
};

export { handler };
