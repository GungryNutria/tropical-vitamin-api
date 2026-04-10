import { Module } from "@nestjs/common";
import { LanguagesService } from "./languages.service";
import { PrismaService } from "src/prisma/prisma.service";
import { LanguagesController } from "./languages.controller";

@Module({
    controllers: [LanguagesController],
    providers: [LanguagesService, PrismaService],
})
export class LanguagesModule {}