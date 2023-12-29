import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

type Region = 'INDONESIA' | 'MALAYSIA' | 'SINGAPORE' | 'GLOBAL';

export class createProductGroupDto {
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
  @IsEnum(['INDONESIA', 'MALAYSIA', 'SINGAPORE', 'GLOBAL'])
  region: Region;

  @ApiProperty()
  @IsString()
  servicesId: string;
}

export class updateProductGroupDto {
  @ApiProperty()
  @IsString()
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
  @IsEnum(['INDONESIA', 'MALAYSIA', 'SINGAPORE', 'GLOBAL'])
  @IsOptional()
  region: Region;

  @ApiProperty()
  @IsString()
  @IsOptional()
  servicesId: string;
}

export class deleteProductGroupDto {
  @ApiProperty()
  @IsString()
  id: string;
}
