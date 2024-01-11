import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

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

type InputFieldType = 'TEXT' | 'SELECT' | 'NUMBER';

type Region = 'GLOBAL' | 'INDONESIA' | 'MALAYSIA' | 'SINGAPORE';

export class createServicesDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  desc: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imgLogo: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imgBanner: string;

  @ApiProperty()
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
  type: Type;

  @ApiProperty()
  @IsBoolean({
    message: 'isAvailable must be boolean',
  })
  isAvailable: boolean;

  @ApiProperty()
  @IsString()
  inputFieldDescription: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldHintImage: string;

  @ApiProperty()
  @IsBoolean()
  isInputFieldOne: boolean;

  @ApiProperty()
  @IsEnum(['TEXT', 'SELECT', 'NUMBER'])
  @IsOptional()
  inputFieldOneType: InputFieldType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldOneOption: any;

  @ApiProperty()
  @IsBoolean()
  isInputFieldTwo: boolean;

  @ApiProperty()
  @IsEnum(['TEXT', 'SELECT', 'NUMBER'])
  @IsOptional()
  inputFieldTwoType: InputFieldType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldTwoOption: any;

  @ApiProperty()
  @IsBoolean()
  isInputFieldThree: boolean;

  @ApiProperty()
  @IsEnum(['TEXT', 'SELECT', 'NUMBER'])
  @IsOptional()
  inputFieldThreeType: InputFieldType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldThreeOption: any;

  @ApiProperty()
  @IsEnum(['GLOBAL', 'INDONESIA', 'MALAYSIA', 'SINGAPORE'])
  region: Region;

  @IsString()
  @ApiProperty()
  @IsOptional()
  metaName: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  metaDesc: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  metaTags: string;
}

export class updateServicesDto {
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
  slug: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  desc: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imgLogo: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  imgBanner: string;

  @ApiProperty()
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
  type: Type;

  @ApiProperty()
  @IsBoolean({
    message: 'isAvailable must be boolean',
  })
  @IsOptional()
  isAvailable: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldDescription: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldHintImage: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isInputFieldOne: boolean;

  @ApiProperty()
  @IsEnum(['TEXT', 'SELECT', 'NUMBER'])
  @IsOptional()
  inputFieldOneType: InputFieldType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldOneOption: any;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isInputFieldTwo: boolean;

  @ApiProperty()
  @IsEnum(['TEXT', 'SELECT', 'NUMBER'])
  @IsOptional()
  inputFieldTwoType: InputFieldType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldTwoOption: any;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isInputFieldThree: boolean;

  @ApiProperty()
  @IsEnum(['TEXT', 'SELECT', 'NUMBER'])
  @IsOptional()
  inputFieldThreeType: InputFieldType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputFieldThreeOption: any;

  @ApiProperty()
  @IsEnum(['GLOBAL', 'INDONESIA', 'MALAYSIA', 'SINGAPORE'])
  @IsOptional()
  region: Region;

  @IsString()
  @ApiProperty()
  @IsOptional()
  metaName: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  metaDesc: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  metaTags: string;
}

export class deleteServicesDto {
  @ApiProperty()
  @IsString()
  id: string;
}
