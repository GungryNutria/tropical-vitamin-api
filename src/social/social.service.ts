import { BadRequestException, Injectable } from '@nestjs/common';
import type { SocialSettings } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSocialDto } from './dtos/social.dto';
import {
  NETWORKS,
  SocialError,
  checkUrl,
  normalizeUrl,
  normalizeWhatsapp,
} from './social.rules';

const DEFAULTS: Omit<SocialSettings, 'id'> = {
  facebookUrl: null,
  facebookVisible: false,
  instagramUrl: null,
  instagramVisible: false,
  linkedinUrl: null,
  linkedinVisible: false,
  whatsappNumber: '529841681263',
  updatedAt: new Date(0),
};

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  private async row() {
    return (
      (await this.prisma.socialSettings.findUnique({ where: { id: 1 } })) ??
      DEFAULTS
    );
  }

  async getPublic() {
    const row = await this.row();
    return {
      whatsappNumber: row.whatsappNumber,
      networks: NETWORKS.filter(
        (n) => row[`${n}Url`] && row[`${n}Visible`],
      ).map((network) => ({
        network,
        url: row[`${network}Url`] as string,
      })),
    };
  }

  async getAdmin() {
    return this.toAdmin(await this.row());
  }

  async update(dto: UpdateSocialDto) {
    const fields: Record<string, SocialError> = {};
    const data: Record<string, string | boolean | null> = {};

    for (const n of NETWORKS) {
      const raw = normalizeUrl(dto[`${n}Url`] ?? '');
      let url: string | null = null;
      if (raw !== null) {
        const res = checkUrl(n, raw);
        if ('error' in res) fields[`${n}Url`] = res.error;
        else url = res.value;
      }
      if (dto[`${n}Visible`] && url === null && !fields[`${n}Url`]) {
        fields[`${n}Visible`] = 'VISIBLE_WITHOUT_URL';
      }
      data[`${n}Url`] = url;
      data[`${n}Visible`] = dto[`${n}Visible`];
    }

    const wa = normalizeWhatsapp(dto.whatsappNumber);
    if ('error' in wa) fields.whatsappNumber = wa.error;
    else data.whatsappNumber = wa.value;

    if (Object.keys(fields).length) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_SOCIAL_SETTINGS',
        message: 'Revisa los campos marcados.',
        fields,
      });
    }

    const saved = await this.prisma.socialSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    return this.toAdmin(saved);
  }

  private toAdmin(r: Omit<SocialSettings, 'id'>) {
    return {
      facebookUrl: r.facebookUrl,
      facebookVisible: r.facebookVisible,
      instagramUrl: r.instagramUrl,
      instagramVisible: r.instagramVisible,
      linkedinUrl: r.linkedinUrl,
      linkedinVisible: r.linkedinVisible,
      whatsappNumber: r.whatsappNumber,
      updatedAt: r.updatedAt,
    };
  }
}
