import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findUser(user: any) {
    const get = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        longName: true,
        phone: true,
        email: true,
        role: true,
      },
    });

    try {
      if (get) {
        return {
          statusCode: 200,
          message: 'Success',
          data: get,
        };
      } else {
        return {
          statusCode: 404,
          message: 'Not Found',
          data: null,
        };
      }
    } catch (error) {
      throw new ForbiddenException('Error');
    }
  }
}
