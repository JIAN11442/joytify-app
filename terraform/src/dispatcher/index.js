import aws from "aws-sdk";
import { MongoClient } from "mongodb";

const lambda = new aws.Lambda();
const sns = new aws.SNS();

const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const TARGET_INVOKE_LAMBDA = process.env.TARGET_INVOKE_LAMBDA;
const SIZE_PER_RANGE = Number(process.env.SIZE_PER_RANGE) || 1000;

export const handler = async (event) => {
  const startTime = Date.now();
  const client = new MongoClient(MONGODB_CONNECTION_STRING);
  let totalInvoked = 0;
  let results = [];

  try {
    await client.connect();

    const db = client.db("mern-joytify");
    const playbackCollection = db.collection("playbacks");

    const totalPlaybacks = await playbackCollection.countDocuments();
    const totalUsers = totalPlaybacks;
    const chunkSize = Math.ceil(totalPlaybacks / SIZE_PER_RANGE);

    const invocations = Array.from({ length: chunkSize }, (_, i) => {
      const skip = i * SIZE_PER_RANGE;
      const limit = SIZE_PER_RANGE;

      return lambda
        .invoke({
          FunctionName: TARGET_INVOKE_LAMBDA,
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({ skip, limit }),
        })
        .promise()
        .then((res) => {
          totalInvoked++;

          const payload = JSON.parse(res.Payload);
          return payload;
        });
    });

    results = await Promise.all(invocations);

    const totalExecutionTimeMs = Date.now() - startTime;
    const totalSuccessProcessed = results.reduce((acc, cur) => acc + cur.successProcessedCount, 0);
    const totalFailedProcessed = results.reduce((acc, cur) => acc + cur.failedProcessCount, 0);
    const totalFailedProcessedUsers = results.flatMap((result) => result.failedProcessUsers);
    const avgTimePerUserMs =
      totalSuccessProcessed > 0
        ? (results.reduce((acc, cur) => acc + cur.durationMs, 0) / totalSuccessProcessed).toFixed(2)
        : 0;
    const successRate =
      totalUsers > 0 ? ((totalSuccessProcessed / totalUsers) * 100).toFixed(2) : 0;

    await sns
      .publish({
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify({
          status: "success",
          total_users: totalUsers,
          total_invoked_lambdas: totalInvoked,
          total_success_processed_users: totalSuccessProcessed,
          total_failed_processed_users: totalFailedProcessed,
          success_rate_percentage: successRate,
          total_execution_time_ms: totalExecutionTimeMs,
          average_time_per_user_ms: avgTimePerUserMs,
          failed_process_users: totalFailedProcessedUsers,
        }),
      })
      .promise();

    console.log(
      `Dispatcher completed in ${totalExecutionTimeMs}ms with ${totalInvoked} invocations`
    );
  } catch (error) {
    console.error("Dispatcher Error:", error);

    await sns
      .publish({
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify({ status: "failure", error: error }),
      })
      .promise();

    throw error;
  } finally {
    await client?.close();
  }
};
