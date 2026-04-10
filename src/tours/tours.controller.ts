import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ToursService } from "./tours.service";

@Controller('tours')
export class ToursController {
    constructor(private toursService: ToursService) {}

    @Get()
    async getTours(@Query('lang') lang: string = 'es') {
        return this.toursService.getTours(lang);
    }

    @Get('all')
    async getAllTours() {
        return this.toursService.getAllTours();
    }

    @Get(':id')
    async getTourById(@Param('id') id: string) {
        return this.toursService.getTourById(parseInt(id));
    }

    @Post()
    async createTour(@Body() body: any) {
        return this.toursService.createTour(body);
    }

    @Patch(':id')
    async updateTour(@Param('id') id: string, @Body() body: any) {
        return this.toursService.updateTour(parseInt(id), body);
    }

    @Delete(':id')
    async deleteTour(@Param('id') id: string) {
        return this.toursService.deleteTour(parseInt(id));
    }
}