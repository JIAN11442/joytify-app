import { MongoClient, ObjectId } from "mongodb";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import dotenv from "dotenv";

// 載入 .env 文件
dotenv.config();

// AWS Secrets Manager 配置
const AWS_REGION = process.env.AWS_REGION;
const SECRET_NAME = process.env.SECRET_NAME;

// MongoDB 配置
const DB_NAME = process.env.DB_NAME;

// 從 AWS Secrets Manager 獲取 MongoDB URI
async function getMongoUriFromSecrets() {
  try {
    const client = new SecretsManagerClient({ region: AWS_REGION });
    const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });
    const response = await client.send(command);
    const secrets = JSON.parse(response.SecretString);
    return secrets.MONGODB_CONNECTION_STRING;
  } catch (error) {
    console.log("⚠️ Using environment variable or fallback");
  }
}

// 測試集合名稱
const TEST_USERS_COLLECTION = "test-users";
const TEST_STATS_COLLECTION = "test-stats";
const TEST_PLAYBACKS_COLLECTION = "test-playbacks";
const TEST_HISTORY_COLLECTION = "test-history";
const TEST_NOTIFICATIONS_COLLECTION = "test-notifications";

// 模板用戶 ID
const TEMPLATE_USER_ID = process.env.TEMPLATE_USER_ID || "6803caa78298bd83e106a989";

// 批次大小（優化性能）
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 500;

// 每個用戶生成的播放記錄數量
const PLAYBACK_RECORDS_PER_USER = parseInt(process.env.PLAYBACK_RECORDS_PER_USER) || 1000;

class TestDataGenerator {
  constructor() {
    this.client = null;
    this.db = null;
    this.currentPart = 0;
  }

  // 日誌工具方法
  logPart(partNumber, title) {
    this.currentPart = partNumber;
    console.log(`\n${"=".repeat(60)}`);
    console.log(`PART ${partNumber}: ${title}`);
    console.log(`${"=".repeat(60)}`);
  }

  logSubPart(title) {
    console.log(`\n📋 ${title}`);
  }

  logSuccess(message) {
    console.log(`✅ ${message}`);
  }

  logError(message) {
    console.log(`❌ ${message}`);
  }

  logInfo(message) {
    console.log(`ℹ️ ${message}`);
  }

  async connect() {
    this.logPart(1, "CONNECTING TO DATABASE");

    this.logSubPart("Retrieving connection string from AWS Secrets Manager");
    const mongoUri = await getMongoUriFromSecrets();

    this.logSubPart("Connecting to MongoDB");
    this.client = new MongoClient(mongoUri);
    await this.client.connect();
    this.db = this.client.db(DB_NAME);

    this.logSuccess("Connected to MongoDB successfully");
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.logInfo("Disconnected from MongoDB");
    }
  }

  // 清除所有測試集合
  async clearTestCollections() {
    this.logPart(2, "CLEARING EXISTING TEST DATA");

    const collections = [
      TEST_USERS_COLLECTION,
      TEST_STATS_COLLECTION,
      TEST_PLAYBACKS_COLLECTION,
      TEST_NOTIFICATIONS_COLLECTION,
    ];

    for (const collectionName of collections) {
      this.logSubPart(`Clearing ${collectionName}`);
      const count = await this.db.collection(collectionName).countDocuments();

      if (count > 0) {
        console.log(`   🔄 Deleting ${count.toLocaleString()} records...`);

        // 直接刪除所有記錄，不使用分批（更快）
        const result = await this.db.collection(collectionName).deleteMany({});

        this.logSuccess(
          `Deleted ${result.deletedCount.toLocaleString()} records from ${collectionName}`
        );
      } else {
        this.logInfo(`No records found in ${collectionName}`);
      }

      // 刪除所有索引（除了 _id 索引）
      this.logSubPart(`Dropping indexes for ${collectionName}`);
      try {
        const indexes = await this.db.collection(collectionName).listIndexes().toArray();
        for (const index of indexes) {
          if (index.name !== "_id_") {
            await this.db.collection(collectionName).dropIndex(index.name);
          }
        }
        this.logSuccess(`Dropped indexes for ${collectionName}`);
      } catch (error) {
        this.logInfo(`No indexes to drop for ${collectionName}`);
      }
    }

    this.logSuccess("All test collections cleared and indexes dropped");
  }

  // 獲取模板數據
  async getTemplates() {
    this.logPart(3, "LOADING TEMPLATE DATA");

    this.logSubPart(`Getting template data for user ID: ${TEMPLATE_USER_ID}`);
    const templateUserId = new ObjectId(TEMPLATE_USER_ID);

    // 獲取模板用戶
    const templateUser = await this.db.collection("users").findOne({ _id: templateUserId });
    if (!templateUser) {
      this.logError(`Template user with ID ${TEMPLATE_USER_ID} not found`);
      throw new Error(`Template user with ID ${TEMPLATE_USER_ID} not found`);
    }

    // 獲取模板統計數據
    const templateStats = await this.db.collection("stats").findOne({ user: templateUserId });
    if (!templateStats) {
      this.logError(`Template stats for user ${TEMPLATE_USER_ID} not found`);
      throw new Error(`Template stats for user ${TEMPLATE_USER_ID} not found`);
    }

    // 獲取模板播放數據
    const templatePlayback = await this.db
      .collection("playbacks")
      .findOne({ user: templateUserId });
    if (!templatePlayback) {
      this.logError(`Template playback for user ${TEMPLATE_USER_ID} not found`);
      throw new Error(`Template playback for user ${TEMPLATE_USER_ID} not found`);
    }

    this.logSuccess("All template data loaded successfully");
    return { templateUser, templateStats, templatePlayback };
  }

  // 生成測試用戶數據
  generateTestUser(index, templateUser, newUserId) {
    return {
      ...templateUser,
      _id: newUserId,
      email: `test_user_${index}@test.com`,
      username: `test_user_${index}`,
      playlists: [],
      songs: [],
      albums: [],
      following: [],
      notifications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // 生成測試統計數據
  generateTestStats(testUserId, templateStats) {
    return {
      ...templateStats,
      _id: new ObjectId(),
      user: testUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // 生成測試播放數據（優化版本）
  generateTestPlayback(testUserId, templatePlayback, showProgress = false) {
    const playbackRecords = new Array(PLAYBACK_RECORDS_PER_USER);
    const now = Date.now();

    // 生成跨越 90 天的歷史數據，以便測試 60 天清理邏輯
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    const totalTimeRange = now - ninetyDaysAgo; // 90 天的時間範圍

    // 分配記錄到不同時間段：
    // 30% 在 60 天前（會被清理）
    // 40% 在 30-60 天前（會被清理）
    // 30% 在 30 天內（不會被清理）
    const oldRecordsCount = Math.floor(PLAYBACK_RECORDS_PER_USER * 0.7); // 70% 是舊數據
    const recentRecordsCount = PLAYBACK_RECORDS_PER_USER - oldRecordsCount; // 30% 是新數據

    for (let i = 0; i < PLAYBACK_RECORDS_PER_USER; i++) {
      let recordTime;

      if (i < oldRecordsCount) {
        // 舊數據：分佈在 90 天前到 60 天前
        const oldDataRange = 30 * 24 * 60 * 60 * 1000; // 30 天範圍
        recordTime = ninetyDaysAgo + (i / oldRecordsCount) * oldDataRange;
      } else {
        // 新數據：分佈在 30 天內
        const recentDataRange = 30 * 24 * 60 * 60 * 1000; // 30 天範圍
        const recentStartTime = now - recentDataRange;
        recordTime =
          recentStartTime + ((i - oldRecordsCount) / recentRecordsCount) * recentDataRange;
      }

      playbackRecords[i] = {
        _id: new ObjectId(),
        user: testUserId,
        song: new ObjectId(),
        artist: new ObjectId(),
        state: i % 2 === 0 ? "completed" : "playing", // 簡化隨機邏輯
        duration: 30 + (i % 300), // 簡化隨機邏輯
        createdAt: new Date(recordTime),
        updatedAt: new Date(),
      };

      // 每 500 條記錄顯示一次進度（簡潔的進度顯示）
      if (showProgress && (i + 1) % 500 === 0) {
        const progress = ((i + 1) / PLAYBACK_RECORDS_PER_USER) * 100;
        process.stdout.write(` (${progress.toFixed(0)}%)`);
      }
    }
    return playbackRecords;
  }

  // 生成測試數據
  async generateTestData(count, appendMode = false) {
    this.logPart(4, "GENERATING TEST DATA");

    // 如果是累積模式，獲取現有用戶數量作為起始索引
    let startUserIndex = 1;
    if (appendMode) {
      const existingUsersCount = await this.db.collection(TEST_USERS_COLLECTION).countDocuments();
      startUserIndex = existingUsersCount + 1;
      this.logInfo(`Append mode: starting from user index ${startUserIndex}`);
    }

    this.logInfo(
      `Target: ${count.toLocaleString()} users with ${PLAYBACK_RECORDS_PER_USER} playback records each`
    );
    this.logInfo(
      `Expected total: ${(count * PLAYBACK_RECORDS_PER_USER).toLocaleString()} playback records`
    );

    // 獲取模板數據
    const { templateUser, templateStats, templatePlayback } = await this.getTemplates();

    const usersCollection = this.db.collection(TEST_USERS_COLLECTION);
    const statsCollection = this.db.collection(TEST_STATS_COLLECTION);
    const playbacksCollection = this.db.collection(TEST_PLAYBACKS_COLLECTION);

    const totalBatches = Math.ceil(count / BATCH_SIZE);
    this.logInfo(`Processing in ${totalBatches} batches (${BATCH_SIZE} records per batch)`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, count);
      const currentBatchSize = endIndex - startIndex;

      this.logSubPart(
        `Processing batch ${batchIndex + 1}/${totalBatches} (${currentBatchSize} users)`
      );

      // 準備批次數據
      const userBatch = [];
      const statsBatch = [];
      const playbackBatch = [];

      // 顯示生成進度
      console.log("   🔄 Generating data...");
      for (let i = startIndex; i < endIndex; i++) {
        const newUserId = new ObjectId();
        const actualUserIndex = startUserIndex + i;
        const testUser = this.generateTestUser(actualUserIndex, templateUser, newUserId);
        const testStats = this.generateTestStats(newUserId, templateStats);

        // 顯示用戶進度（每 10 個用戶更新一次，平衡性能和視覺效果）
        if (i % 10 === 0 || i === endIndex - 1) {
          const userProgress = ((i - startIndex + 1) / currentBatchSize) * 100;
          const userProgressBar = this.createProgressBar(userProgress, 30);
          process.stdout.write(
            `\r   ${userProgressBar} ${userProgress.toFixed(1)}% - User ${actualUserIndex}/${
              startUserIndex + count - 1
            }`
          );
        }

        // 生成 playback 記錄（不顯示進度，保持簡潔）
        const testPlaybackRecords = this.generateTestPlayback(newUserId, templatePlayback, false);

        userBatch.push(testUser);
        statsBatch.push(testStats);
        playbackBatch.push(...testPlaybackRecords);
      }
      process.stdout.write("\n");

      // 批次插入數據
      this.logSubPart("Inserting data to database");
      const insertPromises = [
        usersCollection.insertMany(userBatch),
        statsCollection.insertMany(statsBatch),
      ];

      if (playbackBatch.length > 0) {
        insertPromises.push(playbacksCollection.insertMany(playbackBatch));
      }

      await Promise.all(insertPromises);
      this.logSuccess(`Batch ${batchIndex + 1} completed`);

      // 記憶體清理
      userBatch.length = 0;
      statsBatch.length = 0;
      playbackBatch.length = 0;

      if (global.gc && batchIndex % 10 === 0) {
        global.gc();
      }
    }

    // 計算生成的數據分佈統計
    const totalRecords = count * PLAYBACK_RECORDS_PER_USER;
    const oldRecordsCount = Math.floor(PLAYBACK_RECORDS_PER_USER * 0.7);
    const recentRecordsCount = PLAYBACK_RECORDS_PER_USER - oldRecordsCount;
    const totalOldRecords = count * oldRecordsCount;
    const totalRecentRecords = count * recentRecordsCount;

    this.logSuccess(
      `Generated ${count.toLocaleString()} test users with ${totalRecords.toLocaleString()} playback records`
    );

    console.log(`📊 Data Distribution Summary:`);
    console.log(
      `   Records older than 60 days: ${totalOldRecords.toLocaleString()} (${(
        (oldRecordsCount / PLAYBACK_RECORDS_PER_USER) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `   Records within 30 days: ${totalRecentRecords.toLocaleString()} (${(
        (recentRecordsCount / PLAYBACK_RECORDS_PER_USER) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `   🗑️  Expected cleanup: ${totalOldRecords.toLocaleString()} records will be deleted by 60-day cleanup`
    );
    console.log(
      `   ✅ Expected remaining: ${totalRecentRecords.toLocaleString()} records will remain after cleanup`
    );
  }

  // 創建進度條
  createProgressBar(percentage, width = 50) {
    const filledWidth = Math.round((percentage / 100) * width);
    const emptyWidth = width - filledWidth;
    const filled = "█".repeat(filledWidth);
    const empty = "░".repeat(emptyWidth);
    return `[${filled}${empty}]`;
  }

  // 創建必要的索引（只創建基本索引以節省空間）
  async copyIndexesFromOriginal() {
    this.logPart(5, "SETTING UP DATABASE INDEXES");

    const indexConfigs = [
      {
        collection: TEST_USERS_COLLECTION,
        indexes: [
          // 只保留 _id_ 索引（MongoDB 自動創建）
          // { key: { email: 1 }, name: "email_1" },
          // { key: { username: 1 }, name: "username_1" },
        ],
      },
      {
        collection: TEST_STATS_COLLECTION,
        indexes: [
          // 只保留 _id_ 索引（MongoDB 自動創建）
          // { key: { user: 1 }, name: "user_1" },
        ],
      },
      {
        collection: TEST_PLAYBACKS_COLLECTION,
        indexes: [
          // 只保留 _id_ 索引（MongoDB 自動創建）
          // { key: { user: 1 }, name: "user_1" },
          // { key: { song: 1 }, name: "song_1" },
          // { key: { createdAt: -1 }, name: "createdAt_-1" },
          // { key: { user: 1, createdAt: -1 }, name: "user_1_createdAt_-1" },
        ],
      },
      {
        collection: TEST_NOTIFICATIONS_COLLECTION,
        indexes: [
          // 只保留 _id_ 索引（MongoDB 自動創建）
          // { key: { user: 1 }, name: "user_1" },
          // { key: { createdAt: -1 }, name: "createdAt_-1" },
        ],
      },
    ];

    for (const config of indexConfigs) {
      this.logSubPart(`Setting up ${config.collection}`);

      if (config.indexes.length === 0) {
        this.logInfo(`Using only _id index for ${config.collection}`);
      } else {
        let createdCount = 0;
        for (const index of config.indexes) {
          try {
            await this.db
              .collection(config.collection)
              .createIndex(index.key, { name: index.name });
            createdCount++;
          } catch (error) {
            if (error.message.includes("already exists")) {
              this.logInfo(`Index ${index.name} already exists for ${config.collection}`);
            } else {
              this.logError(`Failed to create index ${index.name}: ${error.message}`);
            }
          }
        }
        this.logSuccess(`Created ${createdCount} indexes for ${config.collection}`);
      }
    }

    this.logSuccess("All basic indexes created successfully");
  }

  // 創建必要的索引
  async createIndexes() {
    try {
      await this.copyIndexesFromOriginal();
    } catch (error) {
      this.logError("Failed to copy original indexes, creating basic indexes instead");

      // 創建基本索引
      await this.db.collection(TEST_USERS_COLLECTION).createIndex({ email: 1 });
      await this.db.collection(TEST_USERS_COLLECTION).createIndex({ username: 1 });
      await this.db.collection(TEST_STATS_COLLECTION).createIndex({ user: 1 });
      await this.db.collection(TEST_PLAYBACKS_COLLECTION).createIndex({ user: 1 });
      await this.db.collection(TEST_PLAYBACKS_COLLECTION).createIndex({ song: 1 });
      await this.db.collection(TEST_PLAYBACKS_COLLECTION).createIndex({ artist: 1 });
      await this.db.collection(TEST_PLAYBACKS_COLLECTION).createIndex({ state: 1 });
      await this.db.collection(TEST_PLAYBACKS_COLLECTION).createIndex({ createdAt: 1 });
      await this.db.collection(TEST_PLAYBACKS_COLLECTION).createIndex({ user: 1, song: 1 });
      await this.db.collection(TEST_PLAYBACKS_COLLECTION).createIndex({ user: 1, createdAt: -1 });

      this.logSuccess("Basic indexes created successfully");
    }
  }

  // 驗證測試數據
  async verifyTestData() {
    this.logPart(6, "VERIFYING TEST DATA");

    const usersCount = await this.db.collection(TEST_USERS_COLLECTION).countDocuments();
    const statsCount = await this.db.collection(TEST_STATS_COLLECTION).countDocuments();
    const playbacksCount = await this.db.collection(TEST_PLAYBACKS_COLLECTION).countDocuments();
    const notificationsCount = await this.db
      .collection(TEST_NOTIFICATIONS_COLLECTION)
      .countDocuments();

    console.log(`📊 Data Summary:`);
    console.log(`   Users: ${usersCount.toLocaleString()}`);
    console.log(`   Stats: ${statsCount.toLocaleString()}`);
    console.log(`   Playbacks: ${playbacksCount.toLocaleString()}`);
    console.log(`   Notifications: ${notificationsCount.toLocaleString()}`);

    const coreCollectionsEqual = usersCount === statsCount;
    const expectedPlaybacks = usersCount * PLAYBACK_RECORDS_PER_USER;
    const playbacksCorrect = playbacksCount === expectedPlaybacks;

    console.log(`\n🔍 Verification Results:`);
    console.log(`   Core data integrity: ${coreCollectionsEqual ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`   Playback count: ${playbacksCorrect ? "✅ PASS" : "❌ FAIL"}`);
    console.log(
      `   Expected: ${expectedPlaybacks.toLocaleString()}, Actual: ${playbacksCount.toLocaleString()}`
    );

    if (!coreCollectionsEqual) {
      throw new Error("Data integrity check failed: core collection counts don't match");
    }

    if (!playbacksCorrect) {
      throw new Error(
        `Playback count mismatch: expected ${expectedPlaybacks}, got ${playbacksCount}`
      );
    }

    // 驗證用戶關係
    this.logSubPart("Verifying user relationships");
    const sampleUsers = await this.db.collection(TEST_USERS_COLLECTION).find({}).limit(5).toArray();
    let relationshipValid = true;

    for (const user of sampleUsers) {
      const statsExists = await this.db
        .collection(TEST_STATS_COLLECTION)
        .findOne({ user: user._id });
      const playbackExists = await this.db
        .collection(TEST_PLAYBACKS_COLLECTION)
        .findOne({ user: user._id });

      if (!statsExists || !playbackExists) {
        relationshipValid = false;
        break;
      }
    }

    console.log(`   User relationships: ${relationshipValid ? "✅ PASS" : "❌ FAIL"}`);

    if (!relationshipValid) {
      throw new Error("User relationship verification failed");
    }

    this.logSuccess("All verification checks passed");
  }

  // 獲取測試數據統計
  async getTestDataStats() {
    this.logPart(1, "TEST DATA STATISTICS");

    const usersCount = await this.db.collection(TEST_USERS_COLLECTION).countDocuments();
    const statsCount = await this.db.collection(TEST_STATS_COLLECTION).countDocuments();
    const playbacksCount = await this.db.collection(TEST_PLAYBACKS_COLLECTION).countDocuments();
    const historyCount = await this.db.collection(TEST_HISTORY_COLLECTION).countDocuments();
    const notificationsCount = await this.db
      .collection(TEST_NOTIFICATIONS_COLLECTION)
      .countDocuments();

    console.log(`📊 Current Test Data:`);
    console.log(`   Users: ${usersCount.toLocaleString()}`);
    console.log(`   Stats: ${statsCount.toLocaleString()}`);
    console.log(`   Playbacks: ${playbacksCount.toLocaleString()}`);
    console.log(`   History: ${historyCount.toLocaleString()}`);
    console.log(`   Notifications: ${notificationsCount.toLocaleString()}`);

    return {
      usersCount,
      statsCount,
      playbacksCount,
      historyCount,
      notificationsCount,
    };
  }
}

// 主要執行函數
async function main() {
  const generator = new TestDataGenerator();

  try {
    await generator.connect();

    const action = process.argv[2];
    const count = parseInt(process.argv[3]) || 1000;

    switch (action) {
      case "generate":
        console.log(`🎯 Generating ${count.toLocaleString()} test users`);
        console.log(`📋 Template user ID: ${TEMPLATE_USER_ID}`);
        await generator.clearTestCollections();
        await generator.generateTestData(count);
        await generator.createIndexes();
        await generator.verifyTestData();
        break;

      case "generate-append":
        console.log(`🎯 Appending ${count.toLocaleString()} test users (accumulative)`);
        console.log(`📋 Template user ID: ${TEMPLATE_USER_ID}`);
        await generator.generateTestData(count, true);
        await generator.verifyTestData();
        break;

      case "clear":
        console.log("🎯 Clearing test data");
        await generator.clearTestCollections();
        break;

      case "verify":
        console.log("🎯 Verifying test data");
        await generator.verifyTestData();
        break;

      case "stats":
        console.log("🎯 Getting test data statistics");
        await generator.getTestDataStats();
        break;

      case "indexes":
        console.log("🎯 Creating indexes");
        await generator.createIndexes();
        break;

      default:
        console.log("📖 Usage:");
        console.log(
          "  node test-data-generator.js generate [count]      # Generate test data (clears existing)"
        );
        console.log(
          "  node test-data-generator.js generate-append [count] # Append test data (accumulative)"
        );
        console.log("  node test-data-generator.js clear                 # Clear test data");
        console.log("  node test-data-generator.js verify                # Verify test data");
        console.log("  node test-data-generator.js stats                 # Get test data stats");
        console.log("  node test-data-generator.js indexes               # Create indexes");
        console.log("");
        console.log(`📋 Template user ID: ${TEMPLATE_USER_ID}`);
        console.log(
          "📁 Test collections: test-users, test-stats, test-playbacks, test-notifications"
        );
        break;
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await generator.disconnect();
  }
}

// 如果直接執行此檔案
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TestDataGenerator };
