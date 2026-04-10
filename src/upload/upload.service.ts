import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client | null = null;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    // SeaweedFS S3 config
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    this.bucket = process.env.S3_BUCKET || 'tropical-vitamin';
    this.publicUrl = process.env.S3_PUBLIC_URL || '';

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        region: 'us-east-1', // SeaweedFS doesn't need region but SDK requires it
        forcePathStyle: true, // Required for SeaweedFS
      });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    if (this.s3Client) {
      await this.uploadToS3(file, filename);
    }

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
    // Clean filename (remove /uploads/ prefix if present)
    const cleanFilename = filename.replace(/^\/uploads\//, '');
    
    if (this.publicUrl) {
      return `${this.publicUrl}/${cleanFilename}`;
    }
    
    // Fallback: construct URL from endpoint
    const endpoint = process.env.S3_ENDPOINT;
    if (endpoint) {
      return `${endpoint}/${this.bucket}/${cleanFilename}`;
    }
    
    return `/uploads/${cleanFilename}`;
  }
}