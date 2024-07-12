import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';
import { CustomError } from 'src/common/custom.error';

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
        throw new CustomError(HttpStatus.UNAUTHORIZED, 'Unauthorized');
      }

      const validate = await this.authService.validateUser(
        jwt,
        payload.userId,
        payload.username,
        payload.role,
      );

      if (!validate) {
        throw new CustomError(HttpStatus.UNAUTHORIZED, 'Unauthorized');
      }

      request.user = validate;

      if (validate.isBanned) {
        throw new CustomError(
          HttpStatus.FORBIDDEN,
          'User is banned, please contact admin',
          'User is banned, please contact admin',
        );
      }

      return true;
    } catch (error) {
      Logger.error(error.message, error.stack, 'TransactionGuard');
      throw new HttpException(
        error.publicMessage || 'Internal server error',
        error.statusCode || 500,
      );
    }
  }
}
