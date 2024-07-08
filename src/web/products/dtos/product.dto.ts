import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseType, ProviderH2H, ServiceType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  desc: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  imgLogo: string;

  @ApiProperty()
  @IsNumber()
  priceFromProvider: number;

  @ApiProperty()
  @IsNumber()
  profit: number = 0;

  @ApiProperty()
  @IsNumber()
  profitInPercent: number = 0;

  @ApiProperty()
  @IsNumber()
  profitReseller: number = 0;

  @ApiProperty()
  @IsNumber()
  profitResellerInPercent: number = 0;

  @IsNumber()
  @ApiProperty()
  stock: number;

  @IsEnum(ServiceType)
  @ApiProperty()
  type: ServiceType;

  @IsEnum(ProductResponseType)
  @ApiProperty()
  typeResponse: ProductResponseType;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isAvailable: boolean;

  @IsEnum(ProviderH2H)
  @ApiProperty()
  h2hProvider: ProviderH2H;

  @IsString()
  @ApiProperty()
  idProductProvider: string;

  @IsString()
  @ApiProperty()
  productGroupId: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  cutOffStart: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  cutOffEnd: string;
}

export class UpdateProductDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  desc: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  imgLogo: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  stock: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  priceFromProvider: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  profit: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  profitInPercent: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  profitReseller: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  profitResellerInPercent: number;

  @IsEnum(ServiceType)
  @IsOptional()
  @ApiProperty()
  type: ServiceType;

  @IsEnum(ProductResponseType)
  @ApiProperty()
  @IsOptional()
  typeResponse: ProductResponseType;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isAvailable: boolean;

  @IsEnum(ProviderH2H)
  @IsOptional()
  @ApiProperty()
  h2hProvider: ProviderH2H;

  @IsString()
  @IsOptional()
  @ApiProperty()
  idProductProvider: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  productGroupId: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  cutOffStart: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  cutOffEnd: string;
}

export class DeleteProductDto {
  @IsString()
  @ApiProperty()
  id: string;
}
