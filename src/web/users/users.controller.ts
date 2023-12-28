import {
  Controller,
  Get,
  NotFoundException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiSecurity('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    console.log(req.user);

    const get = await this.usersService.findAll();
    if (!get) {
      return new NotFoundException('No users found');
    }

    return res.status(200).json({
      message: 'Users found',
      data: get,
    });
  }
}
