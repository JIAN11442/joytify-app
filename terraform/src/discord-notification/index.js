import axios from "axios";

const AWS_REGION = process.env.AWS_REGION;
const LOG_GROUP_NAME = process.env.LOG_GROUP_NAME;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const DISCORD_TIMEZONE =
  process.env.DISCORD_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

// 格式化執行時間為 HH:MM:SS 格式
const formatExecutionTime = (executionTime) => {
  // 從 "722072ms" 格式中提取毫秒數
  const ms = parseInt(executionTime.replace('ms', ''));
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s (${executionTime})`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s (${executionTime})`;
  } else {
    return `${seconds}s (${executionTime})`;
  }
};

const formatSnsMessage = (snsMsg, now, cloudWatchLogsUrl) => {
  try {
    // 成功的月度統計處理
    if (snsMsg.type === "monthly_stats_summary") {
      const data = snsMsg.data;
      const formattedTime = formatExecutionTime(data.executionTime);
      
      return {
        content:
          `## 📊 Monthly Statistics Processed Successfully\n\n` +
          `✅ **Status**: Completed\n` +
          `🔔 **Notifications Created**: ${data.notificationsCreated}\n` +
          `👥 **Users Processed**: ${data.usersProcessed?.toLocaleString() || 0}\n` +
          `📝 **Users Updated**: ${data.usersUpdated?.toLocaleString() || 0}\n` +
          `🧹 **Cleanup Status**: ${data.cleanupTriggered ? "✅ Triggered" : "❌ Failed"}\n` +
          `⏱️ **Execution Time**: ${formattedTime}\n` +
          `🕐 **Completed At**: ${data.timestamp}\n\n` +
          `📋 [View Detailed Logs](${cloudWatchLogsUrl})`
      };
    }
    
    // 成功的清理處理
    else if (snsMsg.source === "playback-data-cleanup") {
      // 支持新舊兩種消息格式
      const data = snsMsg.data || snsMsg.results;
      const executionTime = data.executionTime || `${data.executionTimeMs}ms`;
      const formattedTime = formatExecutionTime(executionTime);
      
      if (data.success !== false) {
        const isTestMode = data.testMode === true;
        const wasTimeoutStopped = data.wasTimeoutStopped === true;
        const remainingRecords = data.remainingRecords || 0;
        const completionPercentage = data.completionPercentage || 100;
        
        let statusText;
        let titleText;
        
        if (wasTimeoutStopped) {
          statusText = "⏰ Partially Completed (Timeout)";
          titleText = "Playback Data Cleanup Partially Completed";
        } else if (isTestMode) {
          statusText = "Test Mode";
          titleText = "Playback Data Cleanup Completed Successfully";
        } else {
          statusText = "Completed";
          titleText = "Playback Data Cleanup Completed Successfully";
        }
        
        return {
          content:
            `## 🧹 ${titleText}\n\n` +
            `✅ **Status**: ${statusText}\n` +
            `📦 **Records Deleted**: ${data.recordsDeleted?.toLocaleString() || 0}\n` +
            `📊 **Total Found**: ${data.totalRecordsFound?.toLocaleString() || 0}\n` +
            (remainingRecords > 0 ? `📋 **Remaining**: ${remainingRecords.toLocaleString()} (${completionPercentage}% complete)\n` : '') +
            `⚙️ **Processing Mode**: ${data.processingMode || 'unknown'}\n` +
            `⏱️ **Execution Time**: ${formattedTime}\n` +
            `🕐 **Completed At**: ${snsMsg.timestamp}\n\n` +
            (wasTimeoutStopped ? `⚠️ **Note**: Process stopped early to prevent timeout. Remaining records will be processed in the next weekly cleanup.\n\n` : '') +
            `📋 [View Detailed Logs](${cloudWatchLogsUrl})`
        };
      } else {
        return {
          content:
            `## 🚨 Playback Data Cleanup Failed\n\n` +
            `❌ **Status**: Error\n` +
            `⚠️ **Error Message**: \`${data.error}\`\n` +
            `⏱️ **Execution Time**: ${formattedTime}\n` +
            `🕐 **Failed At**: ${snsMsg.timestamp}\n\n` +
            `🔧 **Next Steps**: Please check the logs for detailed error information\n` +
            `📋 [View Error Logs](${cloudWatchLogsUrl})`
        };
      }
    }
    
    // 錯誤的月度統計處理
    else if (snsMsg.type === "monthly_stats_error") {
      const data = snsMsg.data;
      return {
        content:
          `## 🚨 Monthly Statistics Processing Failed\n\n` +
          `❌ **Status**: Error\n` +
          `⚠️ **Error Message**: \`${data.error}\`\n` +
          `🕐 **Failed At**: ${data.timestamp}\n\n` +
          `🔧 **Next Steps**: Please check the logs for detailed error information\n` +
          `📋 [View Error Logs](${cloudWatchLogsUrl})`
      };
    }
    
    // 其他格式的消息（包括 CloudWatch Alarm）
    else {
      // 檢查是否為 CloudWatch Alarm
      const isCloudWatchAlarm = snsMsg.AlarmName && snsMsg.NewStateValue;
      const title = isCloudWatchAlarm ? 
        `🚨 CloudWatch Alarm: ${snsMsg.AlarmName}` : 
        `📢 Lambda Notification`;
        
      return {
        content:
          `## ${title}\n\n` +
          `**Message**:\n\`\`\`json\n${JSON.stringify(snsMsg, null, 2)}\`\`\`\n\n` +
          `🕐 **Received At**: ${now}\n` +
          `📋 [View Logs](${cloudWatchLogsUrl})`
      };
    }
  } catch (error) {
    return {
      content:
        `## ❌ Discord Message Processing Error\n\n` +
        `**Error**: \`${error.message}\`\n` +
        `**Raw SNS Message**: \`\`\`json\n${JSON.stringify(snsMsg)}\`\`\`\n\n` +
        `🕐 **Error Time**: ${now}\n` +
        `📋 [View Logs](${cloudWatchLogsUrl})`
    };
  }
};

const handler = async (event) => {
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

export { handler };
