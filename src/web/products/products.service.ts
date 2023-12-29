import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.products.findMany();
  }

  async findById(id: string) {
    try {
      return await this.prismaService.products.findUnique({
        where: {
          id,
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async create(data: Prisma.ProductsCreateInput) {
    return await this.prismaService.products.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ProductsUpdateInput) {
    console.log(id, data);

    try {
      return await this.prismaService.products.update({
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
      return await this.prismaService.products.delete({
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
