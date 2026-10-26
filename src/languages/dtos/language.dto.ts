import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLanguageDto {
  @IsString() @IsNotEmpty()
  code: string;

  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateLanguageDto {
  @IsOptional() @IsString() @IsNotEmpty()
  code?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  name?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
