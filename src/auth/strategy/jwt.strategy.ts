//src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(
    request: Request,
    payload: { userId: string; username: string; role: Role },
  ) {
    if (!request?.headers?.authorization)
      throw new UnauthorizedException('Unauthorized');

    const jwt = request.headers?.authorization.split(' ')[1];

    const user = await this.authService.validateUser(
      jwt,
      payload.userId,
      payload.username,
      payload.role,
    );

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    console.log(user);

    return user;
  }
}
