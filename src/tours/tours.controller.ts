import { Controller, Get, Query } from "@nestjs/common";
import { ToursService } from "./tours.service";

@Controller('tours')
export class ToursController {
    constructor(private toursService: ToursService) {}

    // Add your endpoints here, for example:
    @Get()
    async getTours(@Query('lang') lang: string = 'es') {
        return this.toursService.getTours(lang);
    }
}