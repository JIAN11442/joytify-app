import { MongoClient } from "mongodb";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MONGODB_URI = process.env.MONGODB_URI;
const CLEANUP_DAYS = process.env.CLEANUP_DAYS;
const CLEANUP_BATCH_SIZE = process.env.CLEANUP_BATCH_SIZE;
const CLEANUP_BATCH_DELAY_MS = process.env.CLEANUP_BATCH_DELAY_MS;
const CLEANUP_TIMEOUT_SAFETY_MINUTES = process.env.CLEANUP_TIMEOUT_SAFETY_MINUTES;

/**
 * Cleanup playback data using appropriate method based on dataset size
 */
const cleanupPlaybackData = async (
  collection,
  cutoffDate,
  countToDelete,
  batchSize,
  batchDelayMs,
  startTime,
  timeoutSafetyMinutes
) => {
  const query = { createdAt: { $lt: cutoffDate } };

  if (countToDelete > batchSize) {
    // Cleanup large dataset using cursor-based batch processing
    console.log(
      `Large dataset detected (${countToDelete} records), using cursor-based batch deletion`
    );

    const cursor = collection.find(query, { projection: { _id: 1 } });
    let totalDeleted = 0;
    let batchNumber = 1;
    let batch = [];

    try {
      while (await cursor.hasNext()) {
        const record = await cursor.next();
        batch.push({ deleteOne: { filter: { _id: record._id } } });

        if (batch.length >= batchSize) {
          // Execute batch deletion
          const batchType = batchNumber;
          console.log(`Processing batch ${batchType} (${batch.length} operations)...`);

          const bulkResult = await collection.bulkWrite(batch, { ordered: false });
          totalDeleted += bulkResult.deletedCount;

          console.log(
            `Batch ${batchType} completed: deleted ${bulkResult.deletedCount} records (total: ${totalDeleted})`
          );

          batch = [];
          batchNumber++;

          if (batchDelayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, batchDelayMs));
          }

          // Safety timeout check - stop before Lambda timeout to allow clean shutdown
          if (Date.now() - startTime > timeoutSafetyMinutes * 60 * 1000) {
            console.log(
              `⏰ Safety timeout reached (${timeoutSafetyMinutes} minutes), stopping batch processing gracefully`
            );
            break;
          }
        }
      }

      // Process remaining records
      if (batch.length > 0) {
        console.log(`Processing final batch (${batch.length} operations)...`);
        const bulkResult = await collection.bulkWrite(batch, { ordered: false });
        totalDeleted += bulkResult.deletedCount;
        console.log(
          `Final batch completed: deleted ${bulkResult.deletedCount} records (total: ${totalDeleted})`
        );
      }
    } finally {
      await cursor.close();
    }

    return totalDeleted;
  } else {
    // Cleanup small dataset using direct deletion
    console.log("Small dataset, using direct deletion");
    const result = await collection.deleteMany(query);
    return result.deletedCount;
  }
};

/**
 * Cleanup old playback data with efficient batch processing
 */
const cleanupOldPlaybackData = async (testMode = false) => {
  // Configuration
  const batchSize = parseInt(CLEANUP_BATCH_SIZE || "10000");
  const batchDelayMs = parseInt(CLEANUP_BATCH_DELAY_MS || "100");
  const cleanupDays = parseInt(CLEANUP_DAYS || "60");
  const timeoutSafetyMinutes = parseInt(CLEANUP_TIMEOUT_SAFETY_MINUTES || "14");
  const collectionName = testMode ? "test-playbacks" : "playbacks";

  const startTime = Date.now();

  try {
    // Get MongoDB connection from the handler
    const mongoUri = MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const playbacksCollection = db.collection(collectionName);
    const cutoffDate = new Date(Date.now() - cleanupDays * MS_PER_DAY);

    console.log(`Starting cleanup - keeping ${cleanupDays} days of data`);

    // Count records to delete
    const countToDelete = await playbacksCollection.countDocuments({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`Found ${countToDelete} records to delete`);

    // Early return if no records to delete
    if (countToDelete === 0) {
      await client.close();
      return {
        success: true,
        recordsDeleted: 0,
        totalRecordsFound: 0,
        remainingRecords: 0,
        completionPercentage: 100,
        wasTimeoutStopped: false,
        executionTimeMs: Date.now() - startTime,
        message: "No records to delete",
        cutoffDate: cutoffDate.toISOString(),
        processingMode: "none",
        batchSize: null,
      };
    }

    // Delete records based on dataset size
    const totalDeleted = await cleanupPlaybackData(
      playbacksCollection,
      cutoffDate,
      countToDelete,
      batchSize,
      batchDelayMs,
      startTime,
      timeoutSafetyMinutes
    );

    const executionTimeMs = Date.now() - startTime;
    const wasTimeoutStopped = executionTimeMs > timeoutSafetyMinutes * 60 * 1000;
    const remainingRecords = countToDelete - totalDeleted;
    const completionPercentage =
      countToDelete > 0 ? ((totalDeleted / countToDelete) * 100).toFixed(1) : 100;

    if (wasTimeoutStopped && remainingRecords > 0) {
      console.log(
        `⏰ Cleanup stopped early due to timeout: ${totalDeleted} records deleted, ${remainingRecords} remaining`
      );
    } else {
      console.log(`✅ Cleanup completed: ${totalDeleted} records deleted`);
    }

    await client.close();

    return {
      success: true,
      recordsDeleted: totalDeleted,
      totalRecordsFound: countToDelete,
      remainingRecords: remainingRecords,
      completionPercentage: parseFloat(completionPercentage),
      wasTimeoutStopped: wasTimeoutStopped,
      executionTimeMs: executionTimeMs,
      cutoffDate: cutoffDate.toISOString(),
      processingMode: countToDelete > batchSize ? "batch" : "direct",
      batchSize: countToDelete > batchSize ? batchSize : null,
    };
  } catch (error) {
    console.error("Cleanup process failed:", error);
    throw error;
  }
};

/**
 * Determine cleanup mode from Lambda event
 */
const determineCleanupModeFromEvent = (event) => {
  console.log("Parsing event:", JSON.stringify(event, null, 2));
  const testMode = event.testMode || false;
  console.log(`Parsed event - testMode: ${testMode}`);
  return { testMode };
};

export { cleanupOldPlaybackData, determineCleanupModeFromEvent };
