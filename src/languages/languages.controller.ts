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

    @Post()
    async createLanguage(@Body() body: any) {
        return this.languagesService.createLanguage(body);
    }

    @Patch(':id')
    async updateLanguage(@Param('id') id: string, @Body() body: any) {
        return this.languagesService.updateLanguage(parseInt(id), body);
    }

    @Delete(':id')
    async deleteLanguage(@Param('id') id: string) {
        return this.languagesService.deleteLanguage(parseInt(id));
    }
}