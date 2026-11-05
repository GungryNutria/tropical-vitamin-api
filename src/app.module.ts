import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { ToursModule } from './tours/tours.module';
import { LanguagesModule } from './languages/languages.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { SocialModule } from './social/social.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    MailModule,
    PrismaModule,
    ToursModule,
    LanguagesModule,
    CategoriesModule,
    UploadModule,
    AuthModule,
    SocialModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}