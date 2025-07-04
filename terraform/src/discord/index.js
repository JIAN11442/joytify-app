import axios from "axios";

const AWS_REGION = process.env.AWS_REGION;
const LOG_GROUP_NAME = process.env.LOG_GROUP_NAME;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_TIMEZONE =
  process.env.DISCORD_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const formatSnsMessage = (snsMsg, now, cloudWatchLogsUrl) => {
  try {
    if (snsMsg.status === "success") {
      const failedUsersText =
        snsMsg.failed_process_users && snsMsg.failed_process_users.length > 0
          ? snsMsg.failed_process_users.join("\n")
          : "None";

      return {
        content:
          `**🎯 Stats Processing Report**\n\n` +
          `**Status**: ✅ ${snsMsg.status.toUpperCase()}\n` +
          `**Total Users**: ${snsMsg.total_users?.toLocaleString() || "N/A"}\n` +
          `**Successfully Processed**: ${
            snsMsg.total_success_processed_users?.toLocaleString() || "N/A"
          }\n` +
          `**Failed Processed**: ${
            snsMsg.total_failed_processed_users?.toLocaleString() || "N/A"
          }\n` +
          `**Success Rate**: ${snsMsg.success_rate_percentage || "N/A"}%\n` +
          `**Lambda Invocations**: ${snsMsg.total_invoked_lambdas?.toLocaleString() || "N/A"}\n` +
          `**Total Execution Time**: ${(snsMsg.total_execution_time_ms / 1000).toFixed(2)}s\n` +
          `**Average Time Per User**: ${snsMsg.average_time_per_user_ms || "N/A"}ms\n` +
          `**Timestamp**: ${now}\n\n` +
          `**Failed Users**: ${failedUsersText}\n\n` +
          `**Logs**: [View Logs](${cloudWatchLogsUrl})`,
      };
    } else if (snsMsg.status === "failure") {
      return {
        content:
          `**🚨 Stats Processing Error**\n\n` +
          `**Status**: ❌ ${snsMsg.status.toUpperCase()}\n` +
          `**Error**: ${snsMsg.error || "Unknown error"}\n` +
          `**Timestamp**: ${now}\n\n` +
          `**Logs**: [View Logs](${cloudWatchLogsUrl})`,
      };
    } else {
      return {
        content:
          `**📢 General Notification**\n\n` +
          `**Status**: ${snsMsg.status}\n` +
          `**Detail**: ${JSON.stringify(snsMsg, null, 2)}\n` +
          `**Timestamp**: ${now}\n\n` +
          `**Logs**: [View Logs](${cloudWatchLogsUrl})`,
      };
    }
  } catch (error) {
    return {
      content:
        `**❌ Message Formatting Error**\n\n` +
        `**Error**: ${error.message}\n` +
        `**Raw Message**: ${JSON.stringify(snsMsg)}\n` +
        `**Timestamp**: ${now}\n\n` +
        `**Logs**: [View Logs](${cloudWatchLogsUrl})`,
    };
  }
};

export const handler = async (event) => {
  try {
    const now = new Date().toLocaleString("en-US", { timeZone: DISCORD_TIMEZONE });
    const cloudWatchLogsUrl = `https://${AWS_REGION}.console.aws.amazon.com/cloudwatch/home?region=${AWS_REGION}#logsV2:log-groups/log-group/${encodeURIComponent(
      LOG_GROUP_NAME
    )}`;

    if (!DISCORD_WEBHOOK_URL) {
      return {
        statusCode: 500,
        body: "Discord webhook URL is not set",
      };
    }

    for (const record of event.Records) {
      const snsMsg = JSON.parse(record.Sns.Message);
      const discordMsg = formatSnsMessage(snsMsg, now, cloudWatchLogsUrl);

      console.log("Message sent to Discord:", discordMsg);

      await axios.post(DISCORD_WEBHOOK_URL, discordMsg, {
        headers: { "Content-Type": "application/json" },
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Messages sent to Discord successfully",
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send message to Discord",
        error,
      }),
    };
  }
};
