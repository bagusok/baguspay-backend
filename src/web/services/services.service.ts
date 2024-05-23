import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';

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
      const find = await this.prismaService.services.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          productGroup: {
            include: {
              products: {
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Service get successfully',
        data: find,
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Error getting services');
    }
  }

  async create(data: Prisma.ServicesCreateInput) {
    try {
      const create = await this.prismaService.services.create({
        data,
      });
      if (!create) {
        throw new InternalServerErrorException('Error creating services');
      }

      return {
        statusCode: 200,
        message: 'Service created successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Error creating services');
    }
  }

  async update(id: string, data: Prisma.ServicesUpdateInput) {
    try {
      const ex = await this.prismaService.services.update({
        where: {
          id,
        },
        data,
      });

      if (!ex) {
        throw new InternalServerErrorException('Error updating services');
      }

      return {
        statusCode: 200,
        message: 'Service updated successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Error updating services');
    }
  }

  async delete(id: string) {
    try {
      const ex = await this.prismaService.services.delete({
        where: {
          id,
        },
      });

      if (!ex) {
        throw new InternalServerErrorException('Error deleting services');
      }

      return {
        statusCode: 200,
        message: 'Service deleted successfully',
      };
    } catch (e) {
      throw new InternalServerErrorException('Error deleting services');
    }
  }

  async findServicesBySlug(slug: string) {
    console.log('ss', await slug);
    try {
      const getSvc = await this.prismaService.services.findUnique({
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

      return {
        statusCode: 200,
        message: 'Success get service',
        data: getSvc,
      };
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
