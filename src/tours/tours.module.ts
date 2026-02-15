import { Module } from "@nestjs/common";
import { ToursService } from "./tours.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ToursController } from "./tours.controller";

@Module({
    controllers: [ToursController],
    providers: [ToursService, PrismaService],
})

export class ToursModule {}