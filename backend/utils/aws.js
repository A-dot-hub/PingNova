import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const snsClient = process.env.AWS_REGION
  ? new SNSClient({ region: process.env.AWS_REGION })
  : null;
const cwClient = process.env.AWS_REGION
  ? new CloudWatchLogsClient({ region: process.env.AWS_REGION })
  : null;

export const sendSNSAlert = async (email, subject, message) => {
  if (!snsClient || !process.env.SNS_TOPIC_ARN) {
    console.log(
      `[Mock SNS] To: ${email} | Subject: ${subject} | Message: ${message}`,
    );
    return;
  }
  try {
    const command = new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: subject,
      Message: message,
    });
    await snsClient.send(command);
  } catch (error) {
    console.error("SNS Error:", error);
  }
};

export const logToCloudWatch = async (logStreamName, message) => {
  if (!cwClient || !process.env.CLOUDWATCH_LOG_GROUP) {
    console.log(`[Mock CloudWatch] Stream: ${logStreamName} | Log: ${message}`);
    return;
  }
  try {
    const command = new PutLogEventsCommand({
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
      logStreamName: logStreamName,
      logEvents: [
        {
          message,
          timestamp: Date.now(),
        },
      ],
    });
    await cwClient.send(command);
  } catch (error) {
    console.error("CloudWatch Error:", error);
  }
};
