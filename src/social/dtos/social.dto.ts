import { IsBoolean, IsString, MaxLength, ValidateIf } from 'class-validator';

// Solo valida tipos; las reglas de dominio van en social.rules.ts.
export class UpdateSocialDto {
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(300)
  facebookUrl: string | null;

  @IsBoolean()
  facebookVisible: boolean;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(300)
  instagramUrl: string | null;

  @IsBoolean()
  instagramVisible: boolean;

  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(300)
  linkedinUrl: string | null;

  @IsBoolean()
  linkedinVisible: boolean;

  @IsString()
  @MaxLength(30)
  whatsappNumber: string;
}
