export default interface MailDto {
    name: string;
    email: string;
    phone: string;
    service?: string;
    destination?: string;
    travelers?: string;
    message: string;
}