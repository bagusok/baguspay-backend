import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentAllowAccess,
  PaymentMethodProvider,
  PaymentMethodType,
} from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty()
  @IsString()
  providerId: string;

  @ApiProperty()
  @IsEnum(PaymentMethodProvider)
  provider: PaymentMethodProvider;

  @ApiProperty()
  @IsEnum([
    'TRANSFER_BANK',
    'TRANSFER_EWALLET',
    'DIRECT_EWALLET',
    'VIRTUAL_ACCOUNT',
    'RETAIL_OUTLET',
    'CREDIT_CARD',
    'LINK_PAYMENT',
    'QR_CODE',
    'OTHER',
  ])
  type: PaymentMethodType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  desc: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty()
  @IsNumber()
  fees: number;

  @ApiProperty()
  @IsString()
  feesInPercent: string;

  @ApiProperty()
  @IsNumber()
  minAmount: number;

  @ApiProperty()
  @IsNumber()
  maxAmount: number;

  @ApiProperty()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  expiredInMinutes: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cutOffStart: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cutOffEnd: string;

  @ApiProperty()
  @IsArray()
  paymentAllowAccess: PaymentAllowAccess[];
}

export class UpdatePaymentMethodDto {
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  providerId: string;

  @ApiProperty()
  @IsEnum(PaymentMethodProvider)
  @IsOptional()
  provider: PaymentMethodProvider;

  @ApiProperty()
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  desc: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fees: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  feesInPercent: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  minAmount: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  maxAmount: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  expiredInMinutes: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cutOffStart: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  cutOffEnd: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  paymentAllowAccess: PaymentAllowAccess[];
}

export class DeletePaymentMethodDto {
  @ApiProperty()
  @IsString()
  id: string;
}
