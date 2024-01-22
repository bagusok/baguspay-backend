import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  img: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  link: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  orderNo: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isAvailable: boolean;
}

export class UpdateBannerDto extends CreateBannerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  img: string;
}

export class DeleteBannerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
