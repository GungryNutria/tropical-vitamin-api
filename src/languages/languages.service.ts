import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LanguagesService {
    constructor(private prisma: PrismaService) {}

    async getLanguages() {
        return this.prisma.language.findMany({
            orderBy: {
                code: 'asc',
            },
        });
    }

    async getLanguageById(id: number) {
        return this.prisma.language.findUnique({
            where: { id },
        });
    }

    async createLanguage(data: { code: string; name: string; isActive?: boolean }) {
        return this.prisma.language.create({
            data: {
                code: data.code.toLowerCase(),
                name: data.name,
                isActive: data.isActive ?? true,
            },
        });
    }

    async updateLanguage(id: number, data: { code?: string; name?: string; isActive?: boolean }) {
        return this.prisma.language.update({
            where: { id },
            data: {
                ...(data.code && { code: data.code.toLowerCase() }),
                ...(data.name && { name: data.name }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });
    }

    async deleteLanguage(id: number) {
        return this.prisma.language.delete({
            where: { id },
        });
    }
}