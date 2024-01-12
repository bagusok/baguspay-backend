import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceGroupService } from 'src/web/services/service-group/service-group.service';
import { getPaymentMethodDto } from './dtos/ui.dto';

@Injectable()
export class UiService {
  constructor(
    private readonly serviceGroupService: ServiceGroupService,
    private readonly prismaService: PrismaService,
  ) {}

  async getPaymentMethod(data: getPaymentMethodDto) {
    const checkProduct = await this.prismaService.products.findUniqueOrThrow({
      where: {
        id: data.productId,
      },
    });

    if (!checkProduct) {
      throw new NotFoundException('Product not found');
    }

    const totalPrice = checkProduct.price * data.qty;

    const checkPayment = await this.prismaService.paymentMethod.findMany({
      where: {
        minAmount: {
          lte: totalPrice,
        },
        maxAmount: {
          gte: totalPrice,
        },
      },
    });

    if (!checkPayment || checkPayment.length === 0) {
      throw new NotFoundException('Payment method not found');
    }

    const groupDataByType = (paymentMethods: any) => {
      return paymentMethods.reduce((acc, paymentMethod) => {
        const type = paymentMethod.type;

        acc[type] = acc[type] || [];

        console.log(paymentMethod.feesInPercent, 'percent');
        const percentToDesimal = Number(paymentMethod.feesInPercent) / 100;
        const fees = Math.round(
          percentToDesimal * totalPrice + paymentMethod.fees,
        );

        const price = checkProduct.price * data.qty;
        const _totalPrice = price + fees;

        if (
          _totalPrice >= paymentMethod.minAmount &&
          _totalPrice <= paymentMethod.maxAmount
        ) {
          acc[type].push({
            id: paymentMethod.id,
            name: paymentMethod.name,
            productPrice: checkProduct.price,
            qty: data.qty,
            totalProductPrice: totalPrice,
            fees: fees,
            total: _totalPrice,
          });
        }

        return acc;
      }, {});
    };

    const groupData = groupDataByType(checkPayment);
    return {
      statusCode: 200,
      message: 'Success',
      data: groupData,
    };
  }
}
