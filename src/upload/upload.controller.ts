import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const filename = await this.uploadService.saveFile(file);
    
    return {
      filename,
      url: `/uploads/${filename}`,
    };
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const fileUrl = this.uploadService.getFileUrl(filename);
    
    // If using SeaweedFS, redirect to it
    if (process.env.SEAWEED_FILER) {
      return res.redirect(fileUrl);
    }
    
    // For local storage, would need to serve the file
    // But since we're moving to SeaweedFS, this is mainly for fallback
    throw new BadRequestException('File storage not configured');
  }
}