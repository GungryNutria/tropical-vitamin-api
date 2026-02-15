import { Injectable } from "@nestjs/common";
import { title } from "process";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ToursService {
    constructor(private prisma: PrismaService) {}
    

    async getTours(language: string = 'es') {
        return this.prisma.tour.findMany({
            where: {
                isActive: true,
                tourTranslations: {
                    some: {
                        language
                    },
                },
            },
            select: {
                id: true,
                price: true,
                location: true,
                tourTranslations: {
                    where: { language },
                    select: {
                        title: true,
                        description: true,
                        category: true,
                        duration: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            }
        });
    }
}