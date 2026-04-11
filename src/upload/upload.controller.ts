import { Controller, Post, Get, Param, Body, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import axios from 'axios';
import https from 'https';

// Create an axios instance that follows redirects and allows self-signed certs
const axiosInstance = axios.create({
  maxRedirects: 5,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') customName?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const url = await this.uploadService.saveFile(file, customName);
    
    return {
      url,
    };
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      // Get presigned URL and redirect to it
      const presignedUrl = await this.uploadService.getPresignedUrl(filename);
      console.log('Redirecting to presigned URL');
      
      // Fetch the file using the presigned URL
      const response = await axiosInstance.get(presignedUrl, {
        responseType: 'arraybuffer',
      });
      
      res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400'); // Cache por 1 día
      res.send(response.data);
    } catch (error) {
      console.error('Error fetching file:', error.message);
      throw new BadRequestException('File not found');
    }
  }
}