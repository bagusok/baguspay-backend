import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateServiceGroupDto {
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
  imgLogo: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  orderNo: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  services: string[];
}

export class UpdateServiceGroupDto {
  @ApiProperty()
  @IsUUID()
  id: string;

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
  imgLogo: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  orderNo: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  services: string[];
}

export class DeleteServiceGroupDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
