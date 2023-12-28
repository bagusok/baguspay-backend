import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { CustomException } from 'src/common/custom.exception';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

export type IRole = Role | 'ADMIN' | 'USER' | 'RESELLER';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const { username, email, password, longName, phone } = data;

    const checkUsername = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email,
          },
          {
            phone,
          },
        ],
      },
    });

    if (checkUsername)
      return new CustomException(
        403,
        'Username, email, or phone number already exists',
      );

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        username,
        email,
        password: hashPassword,
        longName,
        phone,
      },
    });

    if (!user) {
      return new CustomException(500, 'Failed to register user');
    }

    return new CustomException(200, 'User successfully registered', user);
  }

  async login(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return new CustomException(404, 'User not found');
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return new CustomException(403, 'Password is wrong');
    }

    const genJwt = await this.jwtService.signAsync({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return new CustomException(200, 'Login success', {
      token: genJwt,
    });
  }

  async validateUser(userId: string, username: string, role: IRole) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        role: true,
        id: true,
      },
    });

    if (!user || user.username !== username || user.role !== role) {
      return null;
    }

    return user;
  }
}
