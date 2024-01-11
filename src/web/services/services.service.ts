import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
      throw new InternalServerErrorException('Error getting services');
    }
  }

  async findById(id: string) {
    try {
      return await this.prismaService.services.findUnique({
        where: {
          id,
        },
        include: {
          productGroup: {
            include: {
              products: true,
            },
          },
        },
      });
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Error getting services');
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

  async findServicesBySlug(slug: string) {
    try {
      return await this.prismaService.services.findUniqueOrThrow({
        where: {
          slug,
        },
        include: {
          productGroup: {
            include: {
              products: {
                orderBy: {
                  price: 'asc',
                },
                select: {
                  id: true,
                  name: true,
                  price: true,
                  desc: true,
                  cutOffStart: true,
                  cutOffEnd: true,
                  isAvailable: true,
                  stock: true,
                  createdAt: true,
                  imgLogo: true,
                },
              },
            },
          },
        },
      });
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Service not found');
    }
  }

  async findAllByUser() {
    try {
      return await this.prismaService.services.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          imgLogo: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
