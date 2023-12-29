import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    try {
      return await this.prismaService.services.findMany();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findById(id: string) {
    try {
      return await this.prismaService.services.findUnique({
        where: {
          id,
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async create(data: Prisma.ServicesCreateInput) {
    try {
      return await this.prismaService.services.create({
        data,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async update(id: string, data: Prisma.ServicesUpdateInput) {
    try {
      return await this.prismaService.services.update({
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
      return await this.prismaService.services.delete({
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
