import { UseGuards } from "@nestjs/common";
import { AdminJwtGuard } from "../auth/admin-jwt.guard";
import { CreateLanguageDto, UpdateLanguageDto } from "./dtos/language.dto";
import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { LanguagesService } from "./languages.service";

@Controller('languages')
export class LanguagesController {
    constructor(private languagesService: LanguagesService) {}

    @Get()
    async getLanguages() {
        return this.languagesService.getLanguages();
    }

    @Get(':id')
    async getLanguageById(@Param('id') id: string) {
        return this.languagesService.getLanguageById(parseInt(id));
    }

    @UseGuards(AdminJwtGuard)
    @Post()
    async createLanguage(@Body() body: CreateLanguageDto) {
        return this.languagesService.createLanguage(body);
    }

    @UseGuards(AdminJwtGuard)
    @Patch(':id')
    async updateLanguage(@Param('id') id: string, @Body() body: UpdateLanguageDto) {
        return this.languagesService.updateLanguage(parseInt(id), body);
    }

    @UseGuards(AdminJwtGuard)
    @Delete(':id')
    async deleteLanguage(@Param('id') id: string) {
        return this.languagesService.deleteLanguage(parseInt(id));
    }
}