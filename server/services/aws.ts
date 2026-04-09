import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogGroupCommand, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'ap-south-1';
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
};

// Only initialize clients if credentials exist
const hasCredentials = !!credentials.accessKeyId && !!credentials.secretAccessKey;

export const s3Client = hasCredentials ? new S3Client({ region, credentials }) : null;
export const snsClient = hasCredentials ? new SNSClient({ region, credentials }) : null;
export const cloudWatchClient = hasCredentials ? new CloudWatchLogsClient({ region, credentials }) : null;

export async function uploadToS3(filename: string, content: string, contentType: string = 'text/csv') {
  if (!s3Client) {
    console.warn('S3 Client not initialized. Skipping upload.');
    return null;
  }

  const bucketName = process.env.S3_BUCKET_NAME || 'pingnova-exports';
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: content,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Generate a pre-signed URL valid for 1 hour
  return getPresignedDownloadUrl(filename);
}

export async function getPresignedDownloadUrl(filename: string) {
  if (!s3Client) return null;
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || 'pingnova-exports',
    Key: filename,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function sendSMS(phoneNumber: string, message: string) {
  if (!snsClient) {
    console.warn('SNS Client not initialized. Skipping SMS.');
    return;
  }

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

export async function logToCloudWatch(message: string, type: 'INFO' | 'ERROR' = 'INFO') {
  if (!cloudWatchClient) {
    console.log(`[${type}] ${message}`);
    return;
  }

  const logGroupName = process.env.CLOUDWATCH_LOG_GROUP || '/pingnova/app-logs';
  const logStreamName = process.env.CLOUDWATCH_LOG_STREAM || 'production';

  const putLogEvents = async () => {
    const command = new PutLogEventsCommand({
      logGroupName,
      logStreamName,
      logEvents: [
        {
          message: `[${type}] ${message}`,
          timestamp: Date.now(),
        },
      ],
    });
    return await cloudWatchClient!.send(command);
  };

  try {
    await putLogEvents();
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      try {
        // Try creating the log group first
        try {
          await cloudWatchClient.send(new CreateLogGroupCommand({ logGroupName }));
        } catch (groupError: any) {
          if (groupError.name !== 'ResourceAlreadyExistsException') {
            throw groupError;
          }
        }
        
        // Then create the log stream
        try {
          await cloudWatchClient.send(new CreateLogStreamCommand({ logGroupName, logStreamName }));
        } catch (streamError: any) {
          if (streamError.name !== 'ResourceAlreadyExistsException') {
            throw streamError;
          }
        }
        
        // Retry putting the log event
        await putLogEvents();
      } catch (retryError) {
        console.error('Failed to create CloudWatch Log Group/Stream or retry logging:', retryError);
      }
    } else {
      console.error('Failed to log to CloudWatch:', error);
    }
  }
}
