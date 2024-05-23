import { Body, Controller, Ip, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  login(@Body() data: LoginDto, @Req() req, @Ip() ip: string) {
    return this.authService.login({
      email: data.email,
      password: data.password,
      ip: ip,
      userAgent: req.headers['user-agent'],
      deviceId: req.headers['x-device-id'],
    });
  }
}
