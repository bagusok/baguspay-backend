import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DepositService } from './deposit.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/roles.decorator';
import { IUserRequest } from '../transaction/transaction.controller';
import { CreateDepositDto } from './deposit.dto';
import { Role } from '@prisma/client';

@Controller('user/deposit')
@ApiTags('Deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @ApiSecurity('access-token')
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles([Role.USER, Role.ADMIN])
  async createDeposit(
    @Req() req: IUserRequest,
    @Body() body: CreateDepositDto,
  ) {
    return await this.depositService.createDeposit(req.user?.id, body);
  }
}
