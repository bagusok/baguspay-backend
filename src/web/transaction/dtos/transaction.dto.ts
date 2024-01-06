import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

type PaidStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
type OrderStatus = 'PENDING' | 'PROCESS' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
type RefundStatus = 'NONE' | 'PENDING' | 'PROCESS' | 'SUCCESS' | 'FAILED';
type PaymentMethodType =
  | 'TRANSFER_BANK'
  | 'TRANSFER_EWALLET'
  | 'DIRECT_EWALLET'
  | 'VIRTUAL_ACCOUNT'
  | 'RETAIL_OUTLET'
  | 'CREDIT_CARD'
  | 'LINK_PAYMENT'
  | 'OTHER';

export class createTransactionDto {
  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsString()
  productService: string;

  @ApiProperty()
  @IsNumber()
  productPrice: number;

  @ApiProperty()
  @IsNumber()
  productQty: number;

  @ApiProperty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  paymentName: string;

  @ApiProperty()
  @IsString()
  paymentMethodId: string;

  @ApiProperty()
  @IsString()
  productId: string;

  @IsDateString()
  @IsOptional()
  expiredAt: Date;
}

export class updateTransactionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsEnum(['PENDING', 'PAID', 'CANCELLED', 'EXPIRED'])
  @IsOptional()
  paidStatus: PaidStatus;

  @ApiProperty()
  @IsEnum(['PENDING', 'PROCESS', 'SUCCESS', 'FAILED', 'CANCELLED'])
  @IsOptional()
  orderStatu: OrderStatus;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isRefunded: boolean;

  @ApiProperty()
  @IsEnum(['NONE', 'PENDING', 'PROCESS', 'SUCCESS', 'FAILED'])
  @IsOptional()
  refundStatus: RefundStatus;
}

export class cancelTransactionDto {
  @ApiProperty()
  @IsString()
  trxId: string;
}
