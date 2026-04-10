import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) {}

    async getCategories() {
        return this.prisma.category.findMany({
            include: {
                _count: {
                    select: { tours: true },
                },
                translations: {
                    include: {
                        language: true,
                    },
                },
            },
            orderBy: {
                adminName: 'asc',
            },
        });
    }

    async getCategoryById(id: number) {
        return this.prisma.category.findUnique({
            where: { id },
            include: {
                translations: {
                    include: {
                        language: true,
                    },
                },
                tours: {
                    include: {
                        translations: {
                            include: {
                                language: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async createCategory(data: { adminName: string; description: string }) {
        return this.prisma.category.create({
            data: {
                adminName: data.adminName.toLowerCase().replace(/\s+/g, '-'),
                description: data.description,
            },
        });
    }

    async updateCategory(id: number, data: { adminName?: string; description?: string }) {
        return this.prisma.category.update({
            where: { id },
            data: {
                ...(data.adminName && { adminName: data.adminName.toLowerCase().replace(/\s+/g, '-') }),
                ...(data.description && { description: data.description }),
            },
        });
    }

    async deleteCategory(id: number) {
        return this.prisma.category.delete({
            where: { id },
        });
    }

    // Translations
    async getCategoryTranslations(categoryId: number) {
        return this.prisma.categoryTranslation.findMany({
            where: { categoryId },
            include: {
                language: true,
            },
        });
    }

    async createCategoryTranslation(categoryId: number, data: { languageId: number; name: string; description: string }) {
        return this.prisma.categoryTranslation.create({
            data: {
                categoryId,
                languageId: data.languageId,
                name: data.name,
                description: data.description,
            },
            include: {
                language: true,
            },
        });
    }

    async updateCategoryTranslation(categoryId: number, languageId: number, data: { name?: string; description?: string }) {
        return this.prisma.categoryTranslation.update({
            where: {
                categoryId_languageId: {
                    categoryId,
                    languageId,
                },
            },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
            },
            include: {
                language: true,
            },
        });
    }

    async deleteCategoryTranslation(categoryId: number, languageId: number) {
        return this.prisma.categoryTranslation.delete({
            where: {
                categoryId_languageId: {
                    categoryId,
                    languageId,
                },
            },
        });
    }
}