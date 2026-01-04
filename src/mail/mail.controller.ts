import { Body, Controller, Injectable, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import type MailDto from './dtos/mail.dto';

@Controller('mail')
export class MailController {
    
    constructor(private readonly mailService: MailService) { }

    @Post()
    async sendEmail(@Body() dto: MailDto){
        return this.mailService.sendContactEmail(dto);
    }
}
