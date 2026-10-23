import { Body, Controller, Injectable, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { MailService } from './mail.service';
import MailDto from './dtos/mail.dto';

@Controller('mail')
export class MailController {
    
    constructor(private readonly mailService: MailService) { }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post()
    async sendEmail(@Body() dto: MailDto){
        return this.mailService.sendContactEmail(dto);
    }
}
