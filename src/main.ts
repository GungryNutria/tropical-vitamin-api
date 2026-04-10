import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from uploads directory (configurable via UPLOAD_DIR)
  const uploadDir = process.env.UPLOAD_DIR || join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true})
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();