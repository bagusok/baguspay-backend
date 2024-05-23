import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
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

    const totalProductPrice = checkProduct.price * data.qty;

    const checkPayment = await this.prismaService.paymentMethod.findMany({
      where: {
        minAmount: {
          lte: totalProductPrice,
        },
        maxAmount: {
          gte: totalProductPrice,
        },
      },
      orderBy: {
        type: 'asc',
      },
    });

    if (!checkPayment || checkPayment.length === 0) {
      throw new NotFoundException('Payment method not found');
    }

    const _datas = [];
    let selected: any = {
      total: 100000000000000000,
    };
    const payType = [];

    checkPayment.forEach((paymentMethod) => {
      let findPayTypeIndex = payType.findIndex((x) => x == paymentMethod.type);

      if (findPayTypeIndex === -1) {
        payType.push(paymentMethod.type);
        _datas.push({ type: paymentMethod.type, data: [] });

        findPayTypeIndex = _datas.length - 1;
      }

      const totalPrice =
        Math.ceil(
          (totalProductPrice / (100 - Number(paymentMethod.feesInPercent))) *
            100,
        ) + paymentMethod.fees;

      const fees = totalPrice - totalProductPrice;

      if (
        totalPrice >= paymentMethod.minAmount &&
        totalPrice <= paymentMethod.maxAmount
      ) {
        if (selected.total > totalPrice) {
          selected = {
            id: paymentMethod.id,
            name: paymentMethod.name,
            type: paymentMethod.type,
            desc: paymentMethod.desc,
            image: paymentMethod.image,
            productPrice: checkProduct.price,
            qty: data.qty,
            totalProductPrice: totalProductPrice,
            fees: fees,
            total: totalPrice,
          };
        }

        _datas[findPayTypeIndex].data.push({
          id: paymentMethod.id,
          name: paymentMethod.name,
          desc: paymentMethod.desc,
          image: paymentMethod.image,
          productPrice: checkProduct.price,
          qty: data.qty,
          totalProductPrice: totalProductPrice,
          fees: fees,
          total: totalPrice,
        });
      }
    });

    return {
      statusCode: 200,
      selected,
      message: 'Success',
      data: _datas,
    };
  }
}
