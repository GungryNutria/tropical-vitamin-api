import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
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

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        region: 'us-east-1',
        forcePathStyle: true,
      });

      // Ensure bucket exists
      await this.ensureBucketExists();
      this.isConfigured = true;
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

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    if (this.s3Client && this.isConfigured) {
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
    const cleanFilename = filename.replace(/^\/uploads\//, '');
    
    if (this.publicUrl) {
      return `${this.publicUrl}/${cleanFilename}`;
    }
    
    const endpoint = process.env.S3_ENDPOINT;
    if (endpoint) {
      return `${endpoint}/${this.bucket}/${cleanFilename}`;
    }
    
    return `/uploads/${cleanFilename}`;
  }
}