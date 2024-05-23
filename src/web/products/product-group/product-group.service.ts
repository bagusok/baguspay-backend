import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ProductGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll({ limit = 10, page = 1, sortBy = 'createdAt.desc' }) {
    try {
      const countPage = await this.prismaService.productGroup.count({});
      const orderBy = {
        [sortBy.split('.')[0]]: sortBy.split('.')[1],
      };

      const getProductGroup = await this.prismaService.productGroup.findMany({
        take: Number(limit),
        skip: (page - 1) * limit,
        orderBy: {
          ...orderBy,
        },
        include: {
          Services: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        statusCode: 200,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPage: Math.ceil(countPage / limit),
          totalData: countPage,
        },
        data: getProductGroup,
      };
    } catch (e) {
      console.log(e);
      return new InternalServerErrorException('Error getting product group');
    }
  }

  async findById(id: string) {
    try {
      return await this.prismaService.productGroup.findUnique({
        where: {
          id,
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async create(data: Prisma.ProductGroupCreateInput) {
    try {
      return await this.prismaService.productGroup.create({
        data,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async update(id: string, data: Prisma.ProductGroupUpdateInput) {
    try {
      return await this.prismaService.productGroup.update({
        where: {
          id,
        },
        data,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async delete(id: string) {
    try {
      return await this.prismaService.productGroup.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
