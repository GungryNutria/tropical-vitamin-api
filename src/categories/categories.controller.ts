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

    @Post()
    async createCategory(@Body() body: any) {
        return this.categoriesService.createCategory(body);
    }

    @Patch(':id')
    async updateCategory(@Param('id') id: string, @Body() body: any) {
        return this.categoriesService.updateCategory(parseInt(id), body);
    }

    @Delete(':id')
    async deleteCategory(@Param('id') id: string) {
        return this.categoriesService.deleteCategory(parseInt(id));
    }

    // Translations
    @Get(':id/translations')
    async getCategoryTranslations(@Param('id') id: string) {
        return this.categoriesService.getCategoryTranslations(parseInt(id));
    }

    @Post(':id/translations')
    async createCategoryTranslation(@Param('id') id: string, @Body() body: any) {
        return this.categoriesService.createCategoryTranslation(parseInt(id), body);
    }

    @Patch(':id/translations/:languageId')
    async updateCategoryTranslation(
        @Param('id') id: string,
        @Param('languageId') languageId: string,
        @Body() body: any
    ) {
        return this.categoriesService.updateCategoryTranslation(parseInt(id), parseInt(languageId), body);
    }

    @Delete(':id/translations/:languageId')
    async deleteCategoryTranslation(
        @Param('id') id: string,
        @Param('languageId') languageId: string
    ) {
        return this.categoriesService.deleteCategoryTranslation(parseInt(id), parseInt(languageId));
    }
}