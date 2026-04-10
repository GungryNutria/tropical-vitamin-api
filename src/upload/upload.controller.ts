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
    const filePath = this.uploadService.getFilePath(filename);
    return res.sendFile(filePath);
  }
}