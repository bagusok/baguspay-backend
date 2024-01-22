import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  CreateBannerDto,
  DeleteBannerDto,
  UpdateBannerDto,
} from './dtos/banner.dto';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/roles.decorator';

@ApiTags('Banner')
@Controller()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @ApiSecurity('access-token')
  @Post('admin/banner/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  async createBanner(@Body() body: CreateBannerDto) {
    return await this.bannerService.createBanner(body);
  }

  @ApiSecurity('access-token')
  @Post('admin/banner/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  async updateBanner(@Body() body: UpdateBannerDto) {
    return await this.bannerService.updateBanner(body);
  }

  @ApiSecurity('access-token')
  @Post('admin/banner/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  async deleteBanner(@Body() body: DeleteBannerDto) {
    return await this.bannerService.deleteBanner(body);
  }

  @Get('banner')
  async getBanner() {
    return await this.bannerService.getAllBanners();
  }
}
