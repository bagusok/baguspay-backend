import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

type Type =
  | 'GAME_DIRECT'
  | 'GAME_VOUCHER'
  | 'TAGIHAN'
  | 'PULSA'
  | 'PAKET_DATA'
  | 'E_MONEY'
  | 'AKUN_PREMIUM'
  | 'SMM'
  | 'LAINNYA';

type TypeResponse = 'DIRECT' | 'DiRECT_RETURN' | 'MANUAL';

type IH2HProvider = 'DIGIFLAZZ' | 'VIPRESELLER' | 'VOCAGAMES' | 'APIGAMES';

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

  @IsNumber()
  @ApiProperty()
  price: number;

  @IsNumber()
  @ApiProperty()
  stock: number;

  @IsNumber()
  @ApiProperty()
  resellerPrice: number;

  @IsEnum([
    'GAME_DIRECT',
    'GAME_VOUCHER',
    'TAGIHAN',
    'PULSA',
    'PAKET_DATA',
    'E_MONEY',
    'AKUN_PREMIUM',
    'SMM',
    'LAINNYA',
  ])
  @ApiProperty()
  type: Type;

  @IsEnum(['DIRECT', 'DiRECT_RETURN', 'MANUAL'])
  @ApiProperty()
  typeResponse: TypeResponse;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isAvailable: boolean;

  @IsEnum(['DIGIFLAZZ', 'VIPRESELLER', 'VOCAGAMES', 'APIGAMES'])
  @ApiProperty()
  h2hProvider: IH2HProvider;

  @IsString()
  @ApiProperty()
  idProductProvider: string;

  @IsNumber()
  @ApiProperty()
  priceFromProvider: number;

  @IsString()
  @ApiProperty()
  productCategoryId: string;
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
  price: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  stock: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  resellerPrice: number;

  @IsEnum([
    'GAME_DIRECT',
    'GAME_VOUCHER',
    'TAGIHAN',
    'PULSA',
    'PAKET_DATA',
    'E_MONEY',
    'AKUN_PREMIUM',
    'SMM',
    'LAINNYA',
  ])
  @IsOptional()
  @ApiProperty()
  type: Type;

  @IsEnum(['DIRECT', 'DiRECT_RETURN', 'MANUAL'])
  @ApiProperty()
  @IsOptional()
  typeResponse: TypeResponse;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isAvailable: boolean;

  @IsEnum(['DIGIFLAZZ', 'VIPRESELLER', 'VOCAGAMES', 'APIGAMES'])
  @IsOptional()
  @ApiProperty()
  h2hProvider: IH2HProvider;

  @IsString()
  @IsOptional()
  @ApiProperty()
  idProductProvider: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  priceFromProvider: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  productCategoryId: string;
}

export class DeleteProductDto {
  @IsString()
  @ApiProperty()
  id: string;
}