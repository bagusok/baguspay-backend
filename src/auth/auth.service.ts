import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { CustomException } from 'src/common/custom.exception';

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
            email: {
              equals: email,
              mode: 'insensitive',
            },
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

  async login({
    email,
    password,
    deviceId,
    userAgent,
    ip,
  }: {
    email: string;
    password: string;
    deviceId: string;
    userAgent: string;
    ip: string;
  }) {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      });
      console.log(user);

      if (!user) {
        throw new CustomException(401, 'Email or Password is wrong');
      }

      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        throw new CustomException(401, 'Email or Password is wrong');
      }

      const genJwt = await this.jwtService.signAsync(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        {
          expiresIn: '7d',
        },
      );

      const searchByDeviceId = await this.prismaService.loginHistory.findFirst({
        where: {
          deviceId,
          userId: user.id,
        },
      });

      if (searchByDeviceId) {
        await this.prismaService.loginHistory.update({
          where: {
            id: searchByDeviceId.id,
          },
          data: {
            userAgent,
            ip,
            token: genJwt,
            expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            isDeleted: false,
          },
        });
      } else {
        await this.prismaService.loginHistory.create({
          data: {
            userId: user.id,
            deviceId,
            userAgent,
            ip,
            token: genJwt,
            expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          },
        });
      }

      return {
        statusCode: 200,
        message: 'Login success',
        data: {
          token: genJwt,
        },
      };
    } catch (err) {
      console.log(err.message);
      throw new HttpException(
        err.publicMessage || err.message,
        err.status || 500,
      );
    }
  }

  async validateUser(
    jwt: string,
    userId: string,
    username: string,
    role: Role,
  ) {
    // const user = await this.prismaService.user.findUnique({
    //   where: {
    //     id: userId,
    //   },
    //   select: {
    //     username: true,
    //     role: true,
    //     id: true,
    //   },
    // });
    // if (!user || user.username !== username || user.role !== role) {
    //   return null;
    // }
    // return user;

    const checkJwt = await this.prismaService.loginHistory.findFirst({
      where: {
        token: jwt,
        user: {
          id: userId,
          username,
          role,
        },
        isDeleted: false,
        expiredAt: {
          gte: new Date(),
        },
      },
      include: {
        user: {
          select: {
            username: true,
            role: true,
            id: true,
          },
        },
      },
    });

    // console.log(jwt, checkJwt, userId, username, role);

    if (!checkJwt) {
      return null;
    }

    return {
      username: checkJwt.user.username,
      role: checkJwt.user.role,
      id: checkJwt.user.id,
      token: jwt,
    };
  }
}
