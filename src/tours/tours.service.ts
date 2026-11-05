import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { MAX_TOUR_IMAGES, normalizeDuration, normalizeImages, normalizeLocation } from "./tours.rules";

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
                images: { some: {} },
            },
            select: {
                id: true,
                price: true,
                img: true,
                isActive: true,
                images: {
                    select: { filename: true },
                    orderBy: { position: 'asc' },
                },
                category: {
                    select: {
                        id: true,
                        adminName: true,
                        translations: {
                            where: { languageId: language.id },
                            select: {
                                name: true,
                            },
                        },
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
                images: { orderBy: { position: 'asc' } },
            },
        });
    }

    /** Valida y normaliza location, duration e images del cuerpo (spec 006). */
    private parseGalleryFields(data: any) {
        const duration = normalizeDuration(data.duration);
        if (duration === 'INVALID') {
            throw new BadRequestException({
                statusCode: 400,
                code: 'INVALID_DURATION',
                message: 'La duración debe ser un número entero de minutos, 1 o más.',
            });
        }

        let images: string[] | undefined;
        if (data.images !== undefined) {
            const result = normalizeImages(data.images);
            if ('error' in result) {
                throw new BadRequestException(
                    result.error === 'TOO_MANY_IMAGES'
                        ? {
                              statusCode: 400,
                              code: 'TOO_MANY_IMAGES',
                              message: `Un tour admite como máximo ${MAX_TOUR_IMAGES} fotos.`,
                              max: MAX_TOUR_IMAGES,
                          }
                        : {
                              statusCode: 400,
                              code: 'INVALID_IMAGES',
                              message: 'Hay fotos con un nombre de archivo no válido.',
                          },
                );
            }
            images = result.images;
        }

        return { location: normalizeLocation(data.location), duration, images };
    }

    private assertVisibleHasPhoto(isActive: boolean, imageCount: number) {
        if (isActive && imageCount === 0) {
            throw new ConflictException({
                statusCode: 409,
                code: 'TOUR_NEEDS_PHOTO',
                message: 'Agrega al menos una foto para mostrar el tour en la web.',
            });
        }
    }

    async createTour(data: any) {
        const { translations, categoryId, adminTitle } = data;
        const { location, duration, images } = this.parseGalleryFields(data);
        const isActive = typeof data.isActive === 'boolean' ? data.isActive : true;

        this.assertVisibleHasPhoto(isActive, images?.length ?? 0);

        const tour = await this.prisma.tour.create({
            data: {
                adminTitle: adminTitle || 'Nuevo Tour',
                price: data.price,
                location: location ?? null,
                duration: duration ?? null,
                img: images?.[0] ? '/uploads/' + images[0] : null,
                isActive,
                categoryId: categoryId || 1,
                translations: {
                    create: translations?.map((t: any) => ({
                        title: t.title,
                        description: t.description,
                        languageId: t.languageId,
                    })) || [],
                },
                images: {
                    create: (images ?? []).map((filename, position) => ({ filename, position })),
                },
            },
        });

        return this.getTourById(tour.id);
    }

    async updateTour(id: number, data: any) {
        const { translations, adminTitle } = data;
        const { location, duration, images } = this.parseGalleryFields(data);

        await this.prisma.$transaction(async (tx) => {
            // Bloquea la fila: dos escrituras simultáneas se serializan y la regla del 409 se evalúa sobre el estado vigente.
            const rows = await tx.$queryRaw<{ isActive: boolean }[]>`SELECT "isActive" FROM "Tour" WHERE "id" = ${id} FOR UPDATE`;
            if (rows.length === 0) {
                throw new NotFoundException(`Tour ${id} no existe`);
            }
            const isActive = typeof data.isActive === 'boolean' ? data.isActive : rows[0].isActive;
            const imageCount = images ? images.length : await tx.tourImage.count({ where: { tourId: id } });
            this.assertVisibleHasPhoto(isActive, imageCount);

            await tx.tour.update({
                where: { id },
                data: {
                    ...(adminTitle && { adminTitle }),
                    ...(data.price !== undefined && { price: data.price }),
                    ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
                    ...(typeof data.isActive === 'boolean' && { isActive: data.isActive }),
                    ...(location !== undefined && { location }),
                    ...(duration !== undefined && { duration }),
                    ...(images && { img: images[0] ? '/uploads/' + images[0] : null }),
                },
            });

            if (images) {
                await tx.tourImage.deleteMany({ where: { tourId: id } });
                await tx.tourImage.createMany({
                    data: images.map((filename, position) => ({ tourId: id, filename, position })),
                });
            }

            if (translations && Array.isArray(translations)) {
                for (const translation of translations) {
                    await tx.tourTranslation.upsert({
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
        });

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
