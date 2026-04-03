import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;
let doBucket: string = '';
let doEndpointUrl: string = '';

export const initDOClient = (endpoint: string, accessKey: string, secretKey: string, bucket: string) => {
  // Ensure endpoint has protocol
  const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
  
  s3Client = new S3Client({
    endpoint: formattedEndpoint,
    region: 'us-east-1', // DigitalOcean Spaces requires a region, often 'us-east-1' works as a default if not specified
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
  doBucket = bucket;
  doEndpointUrl = formattedEndpoint;
  return s3Client;
};

export const getDOClient = () => {
  if (!s3Client) {
    throw new Error('DigitalOcean client not initialized. Waiting for handshake credentials.');
  }
  return s3Client;
};

export const uploadToDO = async (fileName: string, fileBody: Blob | Uint8Array | string, contentType: string): Promise<string> => {
  const client = getDOClient();

  const command = new PutObjectCommand({
    Bucket: doBucket,
    Key: fileName,
    Body: fileBody,
    ContentType: contentType,
    ACL: 'public-read',
  });

  try {
    await client.send(command);
    
    // Construct the public URL
    // e.g., https://my-bucket.nyc3.digitaloceanspaces.com/fileName
    const url = new URL(doEndpointUrl);
    return `https://${doBucket}.${url.hostname}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to DigitalOcean:', error);
    throw error;
  }
};
