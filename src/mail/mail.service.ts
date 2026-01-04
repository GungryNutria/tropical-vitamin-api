import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import MailDto from './dtos/mail.dto';

@Injectable()
export class MailService {
    constructor(private readonly mailer: MailerService) {}

    async sendContactEmail(data: MailDto) {
        return await this.mailer.sendMail({
            to: 'contacto@tropical-vitamin.com',
            subject: `Solicitar informacion de ${data.name}`,
            replyTo: data.email,
            text: `Telefono: ${data.phone} \nMensaje: ${data.message}`,
        })
    }
}
