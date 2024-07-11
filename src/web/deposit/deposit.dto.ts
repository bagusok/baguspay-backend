import { ApiProperty } from '@nestjs/swagger';
import { DepositStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  paymentMethodId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  paymentName: string;
}

export class UpdateDepositDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsEnum(DepositStatus)
  @IsOptional()
  depositStatus: DepositStatus;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  amount: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  fees: number;
}

export class CancelDepositDto {
  @ApiProperty()
  @IsString()
  depositId: string;
}
