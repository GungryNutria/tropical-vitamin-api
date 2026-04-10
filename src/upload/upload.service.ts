import { Injectable, NotFoundException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

@Injectable()
export class UploadService {
  // SeaweedFS master URL (configurable via env)
  private readonly seaweedMaster = process.env.SEAWEED_MASTER || 'http://localhost:9333';
  // SeaweedFS filer URL (configurable via env)
  private readonly seaweedFiler = process.env.SEAWEED_FILER || 'http://localhost:8888';
  // Use SeaweedFS if configured, fallback to local storage
  private readonly useSeaweed = process.env.SEAWEED_FILER !== undefined;

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    if (this.useSeaweed) {
      return this.saveToSeaweed(file, filename);
    }

    // Fallback: return a local path (for dev)
    return `/uploads/${filename}`;
  }

  private async saveToSeaweed(file: Express.Multer.File, filename: string): Promise<string> {
    try {
      // Upload to SeaweedFS filer
      const response = await axios.put(`${this.seaweedFiler}/${filename}`, file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      // Return the URL path for the file
      return `/uploads/${filename}`;
    } catch (error) {
      console.error('SeaweedFS upload error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  getFilePath(filename: string): string {
    // For SeaweedFS, files are served via the filer
    if (this.useSeaweed) {
      return `${this.seaweedFiler}/${filename}`;
    }
    // For local storage, return local path
    return filename;
  }

  // Get the public URL for a file
  getFileUrl(filename: string): string {
    if (this.useSeaweed) {
      // If SEAWEED_PUBLIC_URL is set, use it, otherwise use filer
      const publicUrl = process.env.SEAWEED_PUBLIC_URL || this.seaweedFiler;
      return `${publicUrl}/${filename}`;
    }
    return `/uploads/${filename}`;
  }
}