// 生成月報通知 - 高效聚合處理
const generateMonthlyNotifications = async (
  db,
  startOfMonth,
  startOfNextMonth,
  testMode = false
) => {
  // 測試模式使用 test 集合
  const statsCollection = db.collection(testMode ? "test-stats" : "stats");
  const notificationsCollection = db.collection(testMode ? "test-notifications" : "notifications");
  const usersCollection = db.collection(testMode ? "test-users" : "users");

  console.log("========== PART 1.2.1: 聚合統計數據 ==========");
  console.log("📊 Processing monthly notifications...");

  // 1. 使用聚合管道一次性處理所有當月統計
  let monthlyStatsData;

  try {
    monthlyStatsData = await statsCollection
      .aggregate([
        { $unwind: "$stats" },
        { $match: { "stats.createdAt": { $gte: startOfMonth, $lt: startOfNextMonth } } },
        { $group: { _id: "$user" } },
      ])
      .toArray();

    console.log(`📈 Found ${monthlyStatsData.length} users with monthly stats`);
  } catch (error) {
    console.error("❌ Aggregation failed:", error);
    throw new Error(`Monthly stats generation failed: ${error.message}`);
  }

  if (monthlyStatsData.length === 0) {
    console.log("⏭️ No monthly stats found, skipping notification creation");
    return {
      notificationsCreated: 0,
      usersProcessed: 0,
      usersUpdated: 0,
      notificationId: null,
    };
  }

  console.log("========== PART 1.2.2: 創建通知 ==========");
  // 2. 創建單一月報通知（包含所有用戶統計）
  const notification = await notificationsCollection.insertOne({
    type: "monthlyStatistic",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("========== PART 1.2.3: 更新用戶 ==========");
  console.log(monthlyStatsData);
  // 3. 一次性更新所有用戶的通知列表
  let userIds = monthlyStatsData.map((stat) => stat._id);

  const updateResult = await usersCollection.updateMany(
    {
      _id: { $in: userIds },
      "userPreferences.notifications.monthlyStatistic": true,
    },
    { $push: { "notifications.unread": notification.insertedId } }
  );

  const results = [updateResult.modifiedCount];

  const updatedUsers = results.reduce((sum, count) => sum + count, 0);

  // 保存數據長度用於返回
  const processedUsersCount = monthlyStatsData.length;

  // 記憶體清理
  monthlyStatsData = null;
  userIds = null;
  if (global.gc) {
    global.gc();
    console.log("🗑️ Triggered garbage collection");
  }

  console.log(`✅ Monthly notification process completed:`);
  console.log(`   - Users processed: ${processedUsersCount}`);
  console.log(`   - Users updated: ${updatedUsers}`);
  console.log(`   - Notification ID: ${notification.insertedId}`);

  return {
    notificationsCreated: 1,
    usersProcessed: processedUsersCount,
    usersUpdated: updatedUsers,
    notificationId: notification.insertedId,
  };
};

export { generateMonthlyNotifications };
