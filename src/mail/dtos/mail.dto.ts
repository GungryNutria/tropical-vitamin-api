import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class MailDto {
    @IsString() @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString() @IsNotEmpty()
    phone: string;

    @IsOptional() @IsString()
    service?: string;

    @IsOptional() @IsString()
    destination?: string;

    @IsOptional() @IsString()
    travelers?: string;

    @IsString() @IsNotEmpty()
    message: string;
}
