import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

const PROTECTED_LANGUAGE_CODES = ['es', 'en'];

const protectedLanguage = (code: string, action: string) =>
    new ConflictException({
        statusCode: 409,
        code: 'LANGUAGE_PROTECTED',
        message: `El idioma ${code} lo usa la web y no se puede ${action}.`,
    });

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
        if (data.code) {
            const current = await this.prisma.language.findUnique({ where: { id } });
            if (
                current &&
                PROTECTED_LANGUAGE_CODES.includes(current.code) &&
                data.code.toLowerCase() !== current.code
            ) {
                throw protectedLanguage(current.code, 'cambiar');
            }
        }
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
        const language = await this.prisma.language.findUnique({ where: { id } });
        if (!language) {
            throw new NotFoundException('Language not found');
        }
        if (PROTECTED_LANGUAGE_CODES.includes(language.code)) {
            throw protectedLanguage(language.code, 'eliminar');
        }
        return this.prisma.language.delete({ where: { id } });
    }
}