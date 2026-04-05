import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;
let doBucket: string = '';
let doEndpointUrl: string = '';
let initializationPromise: Promise<S3Client> | null = null;
let resolveClient: (client: S3Client) => void;

initializationPromise = new Promise((resolve) => {
  resolveClient = resolve;
});

export const initDOClient = (endpoint: string, accessKey: string, secretKey: string, bucket: string) => {
  // Ensure endpoint has protocol
  const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
  
  s3Client = new S3Client({
    endpoint: formattedEndpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
  doBucket = bucket;
  doEndpointUrl = formattedEndpoint;
  
  console.log(`[DigitalOcean] Client initialized for bucket: ${bucket} at endpoint: ${formattedEndpoint}`);

  if (resolveClient) {
    resolveClient(s3Client);
  }
  
  return s3Client;
};

export const getDOClient = async () => {
  if (s3Client) return s3Client;
  
  // Wait for initialization with a timeout
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('DigitalOcean client initialization timed out. Check your handshake credentials.')), 10000)
  );

  return Promise.race([initializationPromise!, timeout]);
};

export const uploadToDO = async (fileName: string, fileBody: Blob | Uint8Array | string, contentType: string): Promise<string> => {
  const client = await getDOClient();

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
