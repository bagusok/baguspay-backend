import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
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
      throw new HttpException('Username or email or phone already exists', 400);

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
      throw new HttpException('Failed to register user', 500);
    }

    return {
      statusCode: 200,
      message: 'Register success',
    };
  }

  async login(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      throw new UnauthorizedException('Email or Password is wrong');
    }

    const genJwt = await this.jwtService.signAsync({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      statusCode: 200,
      message: 'Login success',
      data: {
        token: genJwt,
      },
    };
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
