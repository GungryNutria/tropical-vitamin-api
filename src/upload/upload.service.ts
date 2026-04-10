import { Injectable, NotFoundException } from '@nestjs/common';
import { join, extname } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const ext = extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const filePath = join(this.uploadDir, filename);

    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();
      
      writeStream.on('finish', () => resolve(filename));
      writeStream.on('error', reject);
    });
  }

  getFilePath(filename: string): string {
    const filePath = join(this.uploadDir, filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return filePath;
  }
}