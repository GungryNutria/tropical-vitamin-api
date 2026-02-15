import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ToursModule } from './tours/tours.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    PrismaModule,
    ToursModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
