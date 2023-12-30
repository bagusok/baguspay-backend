import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
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

@ApiTags('Payment Method')
@ApiSecurity('access-token')
@Controller('payment-method')
@Roles(['ADMIN'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Get()
  async getAllPaymentMethods(@Res() res: Response) {
    const paymentMethods =
      await this.paymentMethodService.getAllPaymentMethods();
    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      message: 'Get all payment methods successfully',
      data: paymentMethods,
    });
  }

  @Post('create')
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

    return res.status(HttpStatus.CREATED).json({
      statusCode: 201,
      message: 'Create payment method successfully',
    });
  }

  @Post('update')
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
