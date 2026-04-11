import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService implements OnModuleInit {
  private s3Client: S3Client | null = null;
  private bucket: string;
  private publicUrl: string;
  private isConfigured: boolean = false;

  async onModuleInit() {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    this.bucket = process.env.S3_BUCKET || 'tropical-vitamin';
    this.publicUrl = process.env.S3_PUBLIC_URL || '';

    console.log('Upload Service Config:', {
      endpoint,
      bucket: this.bucket,
      publicUrl: this.publicUrl,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
    });

    if (endpoint && accessKeyId && secretAccessKey) {
      // Ensure endpoint uses HTTPS
      const httpsEndpoint = endpoint.replace(/^http:\/\//, 'https://');
      
      this.s3Client = new S3Client({
        endpoint: httpsEndpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        region: 'us-east-1',
        forcePathStyle: true,
        // Handle redirects and self-signed certs
        requestHandler: new NodeHttpHandler({
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false,
          }),
          httpAgent: new (require('http').Agent)(),
        }),
        maxAttempts: 5,
      });

      // Ensure bucket exists
      await this.ensureBucketExists();
      this.isConfigured = true;
      console.log('S3 client configured successfully');
    } else {
      console.log('S3 client NOT configured - missing environment variables');
    }
  }

  private async ensureBucketExists(): Promise<void> {
    if (!this.s3Client) return;

    try {
      // Check if bucket exists
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      console.log(`Bucket '${this.bucket}' already exists`);
    } catch (error) {
      // Bucket doesn't exist, create it
      console.log(`Creating bucket '${this.bucket}'...`);
      try {
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        console.log(`Bucket '${this.bucket}' created successfully`);
      } catch (createError) {
        console.error(`Failed to create bucket '${this.bucket}':`, createError.message);
      }
    }
  }

  async saveFile(file: Express.Multer.File, customName?: string): Promise<string> {
    const ext = extname(file.originalname);
    // Use custom name if provided, otherwise generate UUID
    // Sanitize custom name: lowercase, replace spaces with dashes, remove special chars
    let filename: string;
    if (customName) {
      const sanitized = customName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50); // Limit length
      filename = `${sanitized}${ext}`;
    } else {
      filename = `${uuidv4()}${ext}`;
    }

    console.log('Saving file:', filename, 'configured:', this.isConfigured);

    if (this.s3Client && this.isConfigured) {
      try {
        await this.uploadToS3(file, filename);
        console.log('File uploaded to S3:', filename);
        // Return relative URL so the API proxies it (avoids mixed content issues)
        return `/uploads/${filename}`;
      } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
      }
    }

    // Fallback: return a local path (for dev)
    console.log('Using local fallback');
    return `/uploads/${filename}`;
  }

  private async uploadToS3(file: Express.Multer.File, filename: string): Promise<void> {
    if (!this.s3Client) {
      throw new Error('S3 client not configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
  }

  getFileUrl(filename: string): string {
    const cleanFilename = filename.replace(/^\/uploads\//, '');
    
    if (this.publicUrl) {
      // Ensure publicUrl uses HTTPS
      const httpsPublicUrl = this.publicUrl.replace(/^http:\/\//, 'https://');
      return `${httpsPublicUrl}/${cleanFilename}`;
    }
    
    const endpoint = process.env.S3_ENDPOINT;
    if (endpoint) {
      // Ensure endpoint uses HTTPS
      const httpsEndpoint = endpoint.replace(/^http:\/\//, 'https://');
      return `${httpsEndpoint}/${this.bucket}/${cleanFilename}`;
    }
    
    return `/uploads/${cleanFilename}`;
  }
}