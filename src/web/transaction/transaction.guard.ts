import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class TransactionGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();

      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      if (!jwt) {
        return true;
      }

      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET,
      });

      const payload = jwtService.verify(jwt);
      if (!payload) {
        throw new UnauthorizedException();
      }

      const validate = await this.authService.validateUser(
        payload.userId,
        payload.username,
        payload.role,
      );

      if (!validate) {
        throw new UnauthorizedException();
      }

      request.user = validate;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
