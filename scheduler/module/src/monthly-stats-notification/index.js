import AWS from "aws-sdk";
import { MongoClient } from "mongodb";
import { generateMonthlyNotifications, triggerSocketNotifications } from "./service.js";

const sns = new AWS.SNS();

// MongoDB 連接配置
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "mern-joytify";
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

const handler = async (event) => {
  const startTime = Date.now();
  let client;

  // 檢查是否為測試模式
  const testMode = event.testMode || process.env.TEST_MODE === "true";
  console.log(`🚀 Monthly Stats Lambda started${testMode ? " (TEST MODE)" : ""}`);

  try {
    // 1. 連接 MongoDB
    console.log("========== PART 1.1: 初始化 ==========");

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    console.log("✅ Connected to MongoDB");

    // 2. 獲取當月日期範圍 (使用 UTC 時間)
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth(); // 0-11
    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
    const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1));

    // 3. 獲取所有用戶的當月統計並生成通知
    console.log("========== PART 1.2: 生成通知 ==========");
    console.log(`📅 Processing stats...`);

    const { notificationsCreated, usersProcessed, usersUpdated, notificationId, socketUserIds } =
      await generateMonthlyNotifications(db, startOfMonth, startOfNextMonth, testMode);

    console.log(`📮 Generated ${notificationsCreated} monthly notifications`);
    console.log(`👥 Processed ${usersProcessed} users, updated ${usersUpdated} users`);

    // 4. 觸發 Socket 通知
    console.log("========== PART 1.3: 觸發 Socket 通知 ==========");

    if (usersUpdated > 0 && socketUserIds?.length > 0) {
      await triggerSocketNotifications(
        socketUserIds,
        process.env.API_DOMAIN,
        process.env.API_INTERNAL_SECRET_KEY
      );
    }

    // 5. 直接觸發 playback cleanup Lambda
    console.log("========== PART 1.4: 觸發數據清理 ==========");

    let cleanupTriggered = false;
    try {
      const lambda = new AWS.Lambda();

      await lambda
        .invoke({
          FunctionName: process.env.PLAYBACK_CLEANUP_LAMBDA_NAME || "joytify-playback-data-cleanup",
          InvocationType: "Event", // 異步調用
          Payload: JSON.stringify({
            testMode: testMode,
            triggeredBy: "monthly-stats-notification",
          }),
        })
        .promise();

      console.log("✅ Playback cleanup Lambda triggered successfully");
      cleanupTriggered = true;
    } catch (cleanupError) {
      console.warn("⚠️ Failed to trigger playback cleanup:", cleanupError.message);
      cleanupTriggered = false;
    }

    const executionTime = Date.now() - startTime;

    // 5. 發送執行結果到 SNS (僅通知 Discord)
    console.log("========== PART 1.5: 發送執行結果到 SNS ==========");

    const summaryMessage = {
      source: "monthly-stats-notification",
      type: "monthly_stats_summary",
      data: {
        notificationsCreated,
        usersProcessed,
        usersUpdated,
        notificationId,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
        testMode,
        cleanupTriggered,
      },
    };

    if (SNS_TOPIC_ARN) {
      await sns
        .publish({
          TopicArn: SNS_TOPIC_ARN,
          Message: JSON.stringify(summaryMessage),
        })
        .promise();

      console.log("📡 Summary sent to SNS (Discord notification only)");
    }

    console.log(`🎉 Monthly Stats Lambda completed successfully in ${executionTime}ms`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        summary: summaryMessage.data,
      }),
    };
  } catch (error) {
    console.error("❌ Monthly Stats Lambda failed:", error);

    // 發送錯誤通知
    if (SNS_TOPIC_ARN) {
      try {
        await sns
          .publish({
            TopicArn: SNS_TOPIC_ARN,
            Message: JSON.stringify({
              type: "monthly_stats_error",
              data: {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
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
