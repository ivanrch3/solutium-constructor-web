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

  private constructor() {
    // Intentar inicialización automática desde entorno si están disponibles (SIP v5.4 Fallback)
    const envEndpoint = import.meta.env.VITE_STORAGE_ENDPOINT;
    const envAccessKey = import.meta.env.VITE_STORAGE_ACCESS_KEY;
    const envSecretKey = import.meta.env.VITE_STORAGE_SECRET_KEY;
    const envBucket = import.meta.env.VITE_STORAGE_BUCKET;

    if (envEndpoint && envAccessKey && envSecretKey && envBucket) {
      console.log('[StorageService] Autoinicializando con variables de entorno...');
      this.init(envEndpoint, envAccessKey, envSecretKey, envBucket);
    }
  }

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
    // If we're already fully initialized with real data, don't re-initialize with empty data
    if (this.initialized && this.accessKey && this.secretKey) return;

    const formattedEndpoint = endpoint ? (endpoint.startsWith('http') ? endpoint : `https://${endpoint}`) : '';
    
    try {
      // Only create the S3 client if we have at least an endpoint and keys
      // Otherwise, the service will rely exclusively on the server-side proxy
      if (formattedEndpoint && accessKey && secretKey) {
        this.client = new S3Client({
          endpoint: formattedEndpoint,
          region: 'us-east-1',
          credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
          },
        });
      }
      
      this.bucket = bucket;
      this.endpoint = formattedEndpoint;
      this.accessKey = accessKey;
      this.secretKey = secretKey;
      this.initialized = true;
      
      console.log(`[StorageService] Initialized (Ready for proxy/direct). Bucket: ${bucket || 'unknown (server-side fallback)'}`);
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
      // If we're missing keys, we don't throw yet because the server-side proxy
      // might have the secrets configured in its environment (SIP v5.5)
      const missing = [];
      if (!this.endpoint) missing.push('Endpoint');
      if (!this.accessKey) missing.push('AccessKey');
      if (!this.secretKey) missing.push('SecretKey');
      if (!this.bucket) missing.push('Bucket');
      
      if (missing.length > 0) {
        console.warn(`[StorageService] Missing client-side keys: ${missing.join(', ')}. Proceeding anyway, hoping the server has secrets.`);
      }
      
      // We consider it "ready to try" even if not fully initialized with client keys
      // as long as we have been through the waiting period.
      // We set a flag or just return to allow the attempt.
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
        const errorText = await response.text();
        let errorMsg = `Proxy upload failed with status ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        
        console.error(`[StorageService] Proxy upload error (${response.status}):`, errorMsg);
        throw new Error(errorMsg);
      }

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        console.log(`[StorageService] Proxy upload successful: ${data.url}`);
        return data.url;
      } catch (e) {
        console.error('[StorageService] Failed to parse success response as JSON:', responseText);
        throw new Error('Invalid response from upload proxy');
      }
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
