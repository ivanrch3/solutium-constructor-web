import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * [SIP v5.4] Secure Storage Service
 * Encapsulates DigitalOcean Spaces logic and protects credentials from global exposure.
 */
class StorageService {
  private static instance: StorageService;
  private client: S3Client | null = null;
  private bucket: string = '';
  private endpoint: string = '';
  private accessKey: string = '';
  private secretKey: string = '';
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initializes the client with provided credentials.
   * In a production environment, these should ideally be handled server-side.
   */
  public init(endpoint: string, accessKey: string, secretKey: string, bucket: string): void {
    if (this.initialized) return;

    const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
    
    try {
      this.client = new S3Client({
        endpoint: formattedEndpoint,
        region: 'us-east-1', // DigitalOcean Spaces uses us-east-1 for compatibility
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
      this.bucket = bucket;
      this.endpoint = formattedEndpoint;
      this.accessKey = accessKey;
      this.secretKey = secretKey;
      this.initialized = true;
      
      console.log(`[StorageService] Initialized for bucket: ${bucket}`);
    } catch (error) {
      console.error('[StorageService] Initialization failed:', error);
      throw new Error('Failed to initialize storage service');
    }
  }

  /**
   * Ensures the client is ready before any operation.
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    console.log('[StorageService] Waiting for initialization...');
    
    // If not initialized, we wait for a reasonable time or throw
    // This handles cases where upload is called before handshake completes
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    while (!this.initialized && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
      
      // Every 10 attempts, log progress
      if (attempts % 10 === 0) {
        console.log(`[StorageService] Still waiting for initialization... attempt ${attempts}/${maxAttempts}`);
      }
    }

    if (!this.initialized) {
      const missing = [];
      if (!this.endpoint) missing.push('Endpoint');
      if (!this.accessKey) missing.push('AccessKey');
      if (!this.secretKey) missing.push('SecretKey');
      if (!this.bucket) missing.push('Bucket');
      
      const errorMsg = missing.length > 0 
        ? `Storage service failed to initialize because the following keys are missing: ${missing.join(', ')}.` 
        : 'Storage service not initialized. Handshake might have failed or timed out.';
      
      console.error(`[StorageService] CRITICAL: ${errorMsg}`);
      throw new Error(`${errorMsg} Please ensure the Mother App (Solutium) is providing these credentials or they are set in the environment.`);
    }
  }

  /**
   * Uploads a file to the configured space.
   * Returns the public URL of the uploaded asset.
   */
  public async upload(fileName: string, fileBody: Blob | Uint8Array | string, contentType: string): Promise<string> {
    await this.ensureInitialized();
    
    // We prefer proxying through the server to avoid CORS issues in the browser
    try {
      const formData = new FormData();
      
      let fileToSend: Blob;
      if (fileBody instanceof Blob) {
        fileToSend = fileBody;
      } else if (typeof fileBody === 'string') {
        fileToSend = new Blob([fileBody], { type: contentType });
      } else {
        fileToSend = new Blob([fileBody], { type: contentType });
      }

      formData.append('file', fileToSend);
      formData.append('endpoint', this.endpoint);
      formData.append('accessKey', this.accessKey);
      formData.append('secretKey', this.secretKey);
      formData.append('bucket', this.bucket);
      formData.append('fileName', fileName);
      formData.append('contentType', contentType);

      console.log(`[StorageService] Attempting proxy upload to /api/upload-proxy for ${fileName}`);
      console.log(`[StorageService] Endpoint: ${this.endpoint}, Bucket: ${this.bucket}`);
      
      const proxyUrl = `${window.location.origin}/api/upload-proxy`;
      const response = await fetch(proxyUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = `Proxy upload failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          const text = await response.text();
          errorMsg = text || errorMsg;
        }
        console.error(`[StorageService] Proxy upload error:`, errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log(`[StorageService] Proxy upload successful: ${data.url}`);
      return data.url;
    } catch (proxyError: any) {
      console.warn('[StorageService] Proxy upload failed, attempting direct upload:', proxyError);
      
      // If it's a NetworkError, it might be a connectivity issue
      if (proxyError.name === 'TypeError' && proxyError.message === 'Failed to fetch') {
        console.error('[StorageService] NetworkError detected. The server might be unreachable or CORS is blocking the request.');
      }

      // Fallback to direct upload if proxy fails
      if (!this.client) throw new Error('S3 Client not available');

      let body: any = fileBody;
      
      // Convert stream-like objects to Uint8Array for browser compatibility
      if (fileBody instanceof Blob || (fileBody && typeof (fileBody as any).arrayBuffer === 'function')) {
        const arrayBuffer = await (fileBody as any).arrayBuffer();
        body = new Uint8Array(arrayBuffer);
      } else if (typeof fileBody === 'string') {
        body = new TextEncoder().encode(fileBody);
      }

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: body,
        ContentType: contentType,
        ACL: 'public-read',
      });

      try {
        await this.client.send(command);
        
        const url = new URL(this.endpoint);
        return `https://${this.bucket}.${url.hostname}/${fileName}`;
      } catch (error) {
        console.error('[StorageService] Direct upload failed:', error);
        throw error;
      }
    }
  }

  /**
   * Utility to check if service is ready
   */
  public isReady(): boolean {
    return this.initialized;
  }
}

// Export singleton instance and convenience wrappers
const storageService = StorageService.getInstance();

export const initDOClient = (endpoint: string, accessKey: string, secretKey: string, bucket: string) => {
  return storageService.init(endpoint, accessKey, secretKey, bucket);
};

export const uploadToDO = (fileName: string, fileBody: Blob | Uint8Array | string, contentType: string) => {
  return storageService.upload(fileName, fileBody, contentType);
};

export const isStorageReady = () => {
  return storageService.isReady();
};
