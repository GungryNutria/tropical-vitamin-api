import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString() @IsNotEmpty()
  adminName: string;

  @IsString() @IsNotEmpty()
  description: string;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @IsNotEmpty()
  adminName?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  description?: string;
}

export class CreateCategoryTranslationDto {
  @IsInt()
  languageId: number;

  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  description: string;
}

export class UpdateCategoryTranslationDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  description?: string;
}
