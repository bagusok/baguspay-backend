import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export enum EPaidStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum EOrderStatus {
  PENDING = 'PENDING',
  PROCESS = 'PROCESS',
  SUCCESS = 'SUCCESS',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}
type RefundStatus = 'NONE' | 'PENDING' | 'PROCESS' | 'SUCCESS' | 'FAILED';

export class createTransactionDto {
  @ApiProperty()
  @IsString()
  phone: string;

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
  @IsOptional()
  productQty: number = 1;

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
  paidStatus: EPaidStatus;

  @ApiProperty()
  @IsEnum(['PENDING', 'PROCESS', 'SUCCESS', 'FAILED', 'CANCELLED'])
  @IsOptional()
  orderStatu: EOrderStatus;

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

export class getAllTransactionsDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  page?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  limit?: number;

  @ApiProperty()
  @IsEnum(['PENDING', 'PAID', 'CANCELLED', 'EXPIRED'])
  @IsOptional()
  paidStatus?: EPaidStatus;

  @ApiProperty()
  @IsEnum(['PENDING', 'PROCESS', 'SUCCESS', 'FAILED', 'CANCELLED'])
  @IsOptional()
  orderStatus?: EOrderStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  trxId?: string;
}
