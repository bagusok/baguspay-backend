import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  CreateBannerDto,
  DeleteBannerDto,
  UpdateBannerDto,
} from './dtos/banner.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BannerService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBanner(data: CreateBannerDto) {
    const create = await this.prismaService.bannerSlider.create({
      data,
    });

    if (!create) {
      throw new BadRequestException('Cannot create banner');
    }

    return {
      statusCode: 200,
      message: 'Create banner successfully',
    };
  }

  async updateBanner(_data: UpdateBannerDto) {
    const data: Prisma.BannerSliderUpdateInput = _data;
    delete data.id;

    const update = await this.prismaService.bannerSlider.update({
      data,
      where: {
        id: _data.id,
      },
    });

    if (!update) {
      throw new BadRequestException('Cannot update banner');
    }

    return {
      statusCode: 200,
      message: 'Update banner successfully',
    };
  }

  async deleteBanner(data: DeleteBannerDto) {
    const deleteBanner = await this.prismaService.bannerSlider.delete({
      where: {
        id: data.id,
      },
    });

    if (!deleteBanner) {
      throw new BadRequestException('Cannot delete banner');
    }

    return {
      statusCode: 200,
      message: 'Delete banner successfully',
    };
  }

  async getAllBanners() {
    const banners = await this.prismaService.bannerSlider.findMany();

    if (!banners) {
      throw new BadRequestException('Cannot get banners');
    }

    return {
      statusCode: 200,
      message: 'Get all banners successfully',
      data: banners,
    };
  }
}
