import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ToursService {
    constructor(private prisma: PrismaService) {}

    async getTours(languageCode: string = 'es') {
        // Find language by code
        const language = await this.prisma.language.findFirst({
            where: { code: languageCode },
        });

        if (!language) {
            return [];
        }

        return this.prisma.tour.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                price: true,
                location: true,
                duration: true,
                img: true,
                isActive: true,
                category: {
                    select: {
                        id: true,
                        adminName: true,
                    },
                },
                translations: {
                    where: { languageId: language.id },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        language: {
                            select: { code: true, name: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            }
        });
    }

    async getAllTours() {
        return this.prisma.tour.findMany({
            select: {
                id: true,
                adminTitle: true,
                price: true,
                location: true,
                duration: true,
                img: true,
                isActive: true,
                createdAt: true,
                category: {
                    select: {
                        id: true,
                        adminName: true,
                    },
                },
                translations: {
                    include: {
                        language: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
    }

    async getTourById(id: number) {
        return this.prisma.tour.findUnique({
            where: { id },
            include: {
                category: true,
                translations: {
                    include: {
                        language: true,
                    },
                },
            },
        });
    }

    async createTour(data: any) {
        const { translations, categoryId, adminTitle, ...tourData } = data;
        
        const tour = await this.prisma.tour.create({
            data: {
                adminTitle: adminTitle || 'Nuevo Tour',
                price: tourData.price,
                location: tourData.location,
                duration: tourData.duration || 60,
                img: tourData.img || null,
                isActive: tourData.isActive ?? true,
                categoryId: categoryId || 1,
                translations: {
                    create: translations?.map((t: any) => ({
                        title: t.title,
                        description: t.description,
                        languageId: t.languageId,
                    })) || [],
                },
            },
            include: {
                translations: {
                    include: {
                        language: true,
                    },
                },
            },
        });

        return tour;
    }

    async updateTour(id: number, data: any) {
        const { translations, adminTitle, ...tourData } = data;

        // Update tour basic data
        if (Object.keys(tourData).length > 0 || adminTitle) {
            await this.prisma.tour.update({
                where: { id },
                data: {
                    ...tourData,
                    ...(adminTitle && { adminTitle }),
                },
            });
        }

        // Update translations
        if (translations && Array.isArray(translations)) {
            for (const translation of translations) {
                await this.prisma.tourTranslation.upsert({
                    where: {
                        tourId_languageId: {
                            tourId: id,
                            languageId: translation.languageId,
                        },
                    },
                    update: {
                        title: translation.title,
                        description: translation.description,
                    },
                    create: {
                        tourId: id,
                        languageId: translation.languageId,
                        title: translation.title,
                        description: translation.description,
                    },
                });
            }
        }

        return this.getTourById(id);
    }

    async deleteTour(id: number) {
        await this.prisma.tourTranslation.deleteMany({
            where: { tourId: id },
        });
        
        return this.prisma.tour.delete({
            where: { id },
        });
    }
}