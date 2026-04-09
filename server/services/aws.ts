import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'ap-south-1';

// ✅ Let AWS SDK auto-handle credentials (IAM role or env vars)
export const s3Client = new S3Client({ region });
export const snsClient = new SNSClient({ region });
export const cloudWatchClient = new CloudWatchLogsClient({ region });

/* ========================= S3 ========================= */

export async function uploadToS3(
  filename: string,
  content: string,
  contentType: string = 'text/csv'
) {
  const bucketName = process.env.S3_BUCKET_NAME || 'pingnova-exports';

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: content,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return getPresignedDownloadUrl(filename);
}

export async function getPresignedDownloadUrl(filename: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || 'pingnova-exports',
    Key: filename,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/* ========================= SNS ========================= */

export async function sendSMS(phoneNumber: string, message: string) {
  const command = new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: message,
  });

  try {
    await snsClient.send(command);
    console.log(`SMS sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

/* ====================== CLOUDWATCH ====================== */

export async function logToCloudWatch(
  message: string,
  type: 'INFO' | 'ERROR' = 'INFO'
) {
  const logGroupName =
    process.env.CLOUDWATCH_LOG_GROUP || '/pingnova/app-logs';
  const logStreamName =
    process.env.CLOUDWATCH_LOG_STREAM || 'production';

  try {
    /* 1️⃣ Ensure Log Group */
    try {
      await cloudWatchClient.send(
        new CreateLogGroupCommand({ logGroupName })
      );
    } catch (e: any) {
      if (e.name !== 'ResourceAlreadyExistsException') throw e;
    }

    /* 2️⃣ Ensure Log Stream */
    try {
      await cloudWatchClient.send(
        new CreateLogStreamCommand({ logGroupName, logStreamName })
      );
    } catch (e: any) {
      if (e.name !== 'ResourceAlreadyExistsException') throw e;
    }

    /* 3️⃣ Get Sequence Token */
    const describe = await cloudWatchClient.send(
      new DescribeLogStreamsCommand({
        logGroupName,
        logStreamNamePrefix: logStreamName,
      })
    );

    let sequenceToken =
      describe.logStreams?.find(
        (s) => s.logStreamName === logStreamName
      )?.uploadSequenceToken;

    /* 4️⃣ Send Logs */
    const sendLogs = async (token?: string) => {
      return cloudWatchClient.send(
        new PutLogEventsCommand({
          logGroupName,
          logStreamName,
          logEvents: [
            {
              message: `[${type}] ${message}`,
              timestamp: Date.now(),
            },
          ],
          sequenceToken: token,
        })
      );
    };

    try {
      await sendLogs(sequenceToken);
    } catch (err: any) {
      // 🔥 Handle invalid token automatically
      if (err.name === 'InvalidSequenceTokenException') {
        await sendLogs(err.expectedSequenceToken);
      } else {
        throw err;
      }
    }

  } catch (error) {
    console.error('CloudWatch logging failed:', error);
  }
}