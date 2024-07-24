import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaidStatus, RefundStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

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

  @ApiProperty()
  @IsString()
  @MinLength(4)
  inputData: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  outputData: string;

  @IsDateString()
  @IsOptional()
  expiredAt: Date;
}

export class UpdateStatusTransactionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsEnum(PaidStatus)
  @IsOptional()
  paidStatus: PaidStatus;

  @ApiProperty()
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus: OrderStatus;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isRefunded: boolean;

  @ApiProperty()
  @IsEnum(RefundStatus)
  @IsOptional()
  refundStatus: RefundStatus;
}

export class cancelTransactionDto {
  @ApiProperty()
  @IsString()
  trxId: string;
}

export class createInquiryDto {
  @ApiProperty()
  @IsString()
  customerNumber: string;

  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsPhoneNumber('ID')
  phoneNumber: string;
}

export class PayInquiryDto {
  @ApiProperty()
  @IsString()
  inquiryId: string;

  @ApiProperty()
  @IsString()
  paymentMethodId: string;

  @ApiProperty()
  @IsString()
  paymentName: string;

  @ApiProperty()
  @IsNumber()
  totalPrice: number;
}
