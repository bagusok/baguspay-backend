import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { PaymentMethodService } from './payment-method.service';
import { Request, Response } from 'express';
import {
  CreatePaymentMethodDto,
  DeletePaymentMethodDto,
  UpdatePaymentMethodDto,
} from './dtos/payment-method.dto';
import { Role } from '@prisma/client';

@ApiTags('Payment Method')
@ApiSecurity('access-token')
@Controller('admin/payment-method')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Get()
  @Roles([Role.ADMIN])
  async getAllPaymentMethods(
    @Query()
    query: {
      limit: number;
      page: number;
      sortBy: string;
    },
  ) {
    const paymentMethods =
      await this.paymentMethodService.getAllPaymentMethods(query);

    return paymentMethods;
  }

  @Get('detail/:id')
  @Roles([Role.ADMIN])
  async getPaymentMethodDetail(@Param('id') id: string) {
    const paymentMethod =
      await this.paymentMethodService.getPaymentMethodById(id);

    return paymentMethod;
  }

  @Post('create')
  @Roles([Role.ADMIN])
  async createPaymentMethod(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreatePaymentMethodDto,
  ) {
    const paymentMethod =
      await this.paymentMethodService.createPaymentMethod(body);

    if (!paymentMethod) {
      return new BadRequestException('Failed to create payment method');
    }

    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      message: 'Create payment method successfully',
    });
  }

  @Post('update')
  @Roles([Role.ADMIN])
  async updatePaymentMethod(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatePaymentMethodDto,
  ) {
    const paymentMethod = await this.paymentMethodService.updatePaymentMethod(
      body.id,
      body,
    );

    if (!paymentMethod) {
      return new BadRequestException('Failed to update payment method');
    }

    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      message: 'Update payment method successfully',
    });
  }

  @Post('delete')
  @Roles([Role.ADMIN])
  async deletePaymentMethod(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: DeletePaymentMethodDto,
  ) {
    const paymentMethod = await this.paymentMethodService.deletePaymentMethod(
      body.id,
    );

    if (!paymentMethod) {
      return new BadRequestException('Failed to delete payment method');
    }

    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      message: 'Delete payment method successfully',
    });
  }
}
