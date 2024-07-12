import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

export class ChangeProfileDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  longName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ValidateIf((o) => o.password == o.confirmPassword, {
    message: 'Password and confirm password must be the same',
  })
  @IsOptional()
  confirmPassword: string;
}

export class ChangeProfileByAdminDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  longName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @ValidateIf((o) => o.password == o.confirmPassword, {
    message: 'Password and confirm password must be the same',
  })
  @IsOptional()
  confirmPassword: string;

  @ApiProperty()
  @IsEnum(Role)
  @IsOptional()
  role: Role;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isBannded: boolean;
}
