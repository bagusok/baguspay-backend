import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { DigiflazzService } from 'src/modules/h2hprovider/digiflazz/digiflazz.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AutoService {
  private readonly logger = new Logger(AutoService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly digiflazz: DigiflazzService,
  ) {}

  async getDigiflazzProduct() {
    const getProducts = await this.digiflazz.getAllProduct();
    if (getProducts.data?.rc)
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Request',
          message: 'Rate Limit Exceeded',
        },
        429,
      );

    for (let i = 0; i < getProducts.data.length; i++) {
      const profitInPercent =
        getProducts.data[i].price <= 30000
          ? 0.1
          : getProducts.data[i].price <= 100000
            ? 0.05
            : 0.03;

      const updateOrCreate = await this.prismaService.products.upsert({
        where: {
          sku_code: getProducts.data[i].buyer_sku_code,
        },
        update: {
          name: getProducts.data[i].product_name,
          priceFromProvider: getProducts.data[i].price,
          idProductProvider: getProducts.data[i].buyer_sku_code,
          stock: getProducts.data[i].unlimited_stock
            ? 999999
            : getProducts.data[i].stock,
          cutOffStart: this.parseCutOffTime(getProducts.data[i].start_cut_off),
          cutOffEnd: this.parseCutOffTime(getProducts.data[i].end_cut_off),
          price:
            getProducts.data[i].price +
            profitInPercent * getProducts.data[i].price,
        },
        create: {
          sku_code: getProducts.data[i].buyer_sku_code,
          name: getProducts.data[i].product_name,
          priceFromProvider: getProducts.data[i].price,
          idProductProvider: getProducts.data[i].buyer_sku_code,
          stock: getProducts.data[i].unlimited_stock
            ? 999999
            : getProducts.data[i].stock,
          cutOffStart: this.parseCutOffTime(getProducts.data[i].start_cut_off),
          cutOffEnd: this.parseCutOffTime(getProducts.data[i].end_cut_off),
          price:
            getProducts.data[i].price +
            profitInPercent * getProducts.data[i].price,
          type:
            getProducts.data[i].category == 'Data'
              ? 'PAKET_DATA'
              : getProducts.data[i].category == 'Games'
                ? 'GAME_DIRECT'
                : 'LAINNYA',
          typeResponse: 'DIRECT',
          profit: 0,
          profitInPercent: profitInPercent * 100,
          resellerPrice: getProducts.data[i].price + 200,
          productGroup: {
            connectOrCreate: {
              where: {
                id: createHash('md5')
                  .update(
                    `${(getProducts.data[i].brand as string).toLowerCase()}${(
                      getProducts.data[i].type as string
                    ).toLowerCase()}`,
                  )
                  .digest('hex')
                  .toString(),
              },
              create: {
                id: createHash('md5')
                  .update(
                    `${(getProducts.data[i].brand as string).toLowerCase()}${(
                      getProducts.data[i].type as string
                    ).toLowerCase()}`,
                  )
                  .digest('hex')
                  .toString(),
                name: getProducts.data[i].type,
                subName: `${getProducts.data[i].brand} - ${getProducts.data[i].type}`,
              },
            },
          },
        },
      });

      console.log(updateOrCreate);
    }

    return {
      statusCode: 200,
      message: 'Success Get Digiflazz Products',
      data: getProducts.data,
    };
  }

  private parseCutOffTime(cutOffTime: string) {
    const [hour, minute] = cutOffTime.split(':');
    let dHour = '';
    let dMinute = '';

    if (hour.length < 2) {
      dHour = '0' + hour;
    } else {
      dHour = hour;
    }

    if (minute.length < 2) {
      dMinute = '0' + minute;
    } else {
      dMinute = minute;
    }

    return `${dHour}:${dMinute}`;
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'handle expired transaction',
    timeZone: 'Asia/Jakarta',
  })
  async handleExpiredTransaction() {
    this.logger.log('Checking expired transaction');
    try {
      await this.prismaService
        .$queryRaw`UPDATE transactions SET paid_status = 'EXPIRED' WHERE paid_status = 'PENDING' AND expired_at <= NOW() at TIME ZONE 'utc'`;
      this.logger.log('Expired transaction has been updated');
    } catch (err) {
      this.logger.error(err);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'handle expired deposit',
    timeZone: 'Asia/Jakarta',
  })
  async handleExpiredDeposit() {
    this.logger.log('Checking expired deposit');
    try {
      await this.prismaService
        .$queryRaw`UPDATE Deposit SET deposit_status = 'EXPIRED' WHERE deposit_status = 'PENDING' AND expired_at <= NOW() at TIME ZONE 'utc'`;
      this.logger.log('Expired deposit has been updated');
    } catch (err) {
      this.logger.error(err);
    }
  }
}
