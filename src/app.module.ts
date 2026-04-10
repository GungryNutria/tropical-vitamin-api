import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ToursModule } from './tours/tours.module';
import { LanguagesModule } from './languages/languages.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    MailModule,
    PrismaModule,
    ToursModule,
    LanguagesModule,
    CategoriesModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
