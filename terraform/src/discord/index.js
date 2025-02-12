import axios from "axios";

export const handler = async (event) => {
  try {
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const logGroupName = process.env.LOG_GROUP_NAME;
    const awsRegion = process.env.AWS_REGION;
    const timezone =
      process.env.DISCORD_TIMEZONE ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";

    const now = new Date().toLocaleString("en-US", { timeZone: timezone });
    const cloudWatchLogsUrl = `https://${awsRegion}.console.aws.amazon.com/cloudwatch/home?region=${awsRegion}#logsV2:log-groups/log-group/${encodeURIComponent(
      logGroupName
    )}`;

    if (!discordWebhookUrl) {
      return {
        statusCode: 500,
        body: "Discord webhook URL is not set",
      };
    }

    for (const record of event.Records) {
      const snsMsg = JSON.parse(record.Sns.Message);
      const discordMsg = {
        content:
          `**Notification**\n` +
          `**Status**: ${snsMsg.status}\n` +
          `**Detail**: ${snsMsg.detail}\n` +
          `**Timestamp**: ${now}\n` +
          `**Logs**: [View Logs](${cloudWatchLogsUrl})`,
      };

      console.log("Message sent to Discord:", discordMsg);

      await axios.post(discordWebhookUrl, discordMsg, {
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
