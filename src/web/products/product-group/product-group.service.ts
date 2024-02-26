import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    try {
      return await this.prismaService.productGroup.findMany({
        orderBy: {
          Services: {
            name: 'asc',
          },
        },
        include: {
          Services: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (e) {
      console.log(e);
      return null;
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
