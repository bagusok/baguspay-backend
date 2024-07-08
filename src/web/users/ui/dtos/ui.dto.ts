import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class getPaymentMethodDto {
  @ApiProperty({
    required: true,
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  qty: number;
}

export class getPaymentMethodInquiryDto {
  @ApiProperty()
  @IsString()
  inquiryId: string;
}
