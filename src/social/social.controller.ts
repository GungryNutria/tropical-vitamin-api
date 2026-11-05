import { Body, Controller, Get, Header, Put, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/admin-jwt.guard';
import { UpdateSocialDto } from './dtos/social.dto';
import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get()
  @Header('Cache-Control', 'no-cache')
  getPublic() {
    return this.socialService.getPublic();
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin')
  getAdmin() {
    return this.socialService.getAdmin();
  }

  @UseGuards(AdminJwtGuard)
  @Put()
  update(@Body() body: UpdateSocialDto) {
    return this.socialService.update(body);
  }
}
