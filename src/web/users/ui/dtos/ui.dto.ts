import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

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
