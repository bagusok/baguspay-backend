import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateServiceGroupDto,
  DeleteServiceGroupDto,
  UpdateServiceGroupDto,
} from './service-group.dto';

@Injectable()
export class ServiceGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    try {
      const get = await this.prismaService.serviceGroup.findMany({
        include: {
          services: true,
        },
        orderBy: {
          orderNo: 'asc',
        },
      });

      return {
        statusCode: 200,
        message: 'Success',
        data: get,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async create(_data: CreateServiceGroupDto) {
    try {
      const create = await this.prismaService.serviceGroup.create({
        data: {
          name: _data.name,
          desc: _data.desc,
          imgLogo: _data.imgLogo,
          orderNo: _data.orderNo,
          services: {
            connect: _data?.services?.map((id) => ({ id })),
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Success',
        data: create,
      };
    } catch (err) {
      console.log('ini error', err);
      throw new InternalServerErrorException('Error Ngab');
    }
  }

  async update(_data: UpdateServiceGroupDto) {
    try {
      const update = await this.prismaService.serviceGroup.update({
        where: { id: _data.id },
        data: {
          name: _data.name,
          desc: _data.desc,
          imgLogo: _data.imgLogo,
          orderNo: _data.orderNo,
          services: {
            connect: _data?.services?.map((id) => ({ id })),
          },
        },
      });

      return {
        statusCode: 200,
        message: 'Success',
        data: update,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async delete(_data: DeleteServiceGroupDto) {
    try {
      const deleteData = await this.prismaService.serviceGroup.delete({
        where: { id: _data.id },
      });

      return {
        statusCode: 200,
        message: 'Success',
        data: deleteData,
      };
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
