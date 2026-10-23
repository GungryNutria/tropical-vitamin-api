import { UseGuards } from "@nestjs/common";
import { AdminJwtGuard } from "../auth/admin-jwt.guard";
import { CreateCategoryDto, UpdateCategoryDto, CreateCategoryTranslationDto, UpdateCategoryTranslationDto } from "./dtos/category.dto";
import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { CategoriesService } from "./categories.service";

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    @Get()
    async getCategories() {
        return this.categoriesService.getCategories();
    }

    @Get(':id')
    async getCategoryById(@Param('id') id: string) {
        return this.categoriesService.getCategoryById(parseInt(id));
    }

    @UseGuards(AdminJwtGuard)
    @Post()
    async createCategory(@Body() body: CreateCategoryDto) {
        return this.categoriesService.createCategory(body);
    }

    @UseGuards(AdminJwtGuard)
    @Patch(':id')
    async updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
        return this.categoriesService.updateCategory(parseInt(id), body);
    }

    @UseGuards(AdminJwtGuard)
    @Delete(':id')
    async deleteCategory(@Param('id') id: string) {
        return this.categoriesService.deleteCategory(parseInt(id));
    }

    // Translations
    @Get(':id/translations')
    async getCategoryTranslations(@Param('id') id: string) {
        return this.categoriesService.getCategoryTranslations(parseInt(id));
    }

    @UseGuards(AdminJwtGuard)
    @Post(':id/translations')
    async createCategoryTranslation(@Param('id') id: string, @Body() body: CreateCategoryTranslationDto) {
        return this.categoriesService.createCategoryTranslation(parseInt(id), body);
    }

    @UseGuards(AdminJwtGuard)
    @Patch(':id/translations/:languageId')
    async updateCategoryTranslation(
        @Param('id') id: string,
        @Param('languageId') languageId: string,
        @Body() body: UpdateCategoryTranslationDto
    ) {
        return this.categoriesService.updateCategoryTranslation(parseInt(id), parseInt(languageId), body);
    }

    @UseGuards(AdminJwtGuard)
    @Delete(':id/translations/:languageId')
    async deleteCategoryTranslation(
        @Param('id') id: string,
        @Param('languageId') languageId: string
    ) {
        return this.categoriesService.deleteCategoryTranslation(parseInt(id), parseInt(languageId));
    }
}