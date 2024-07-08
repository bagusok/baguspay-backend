import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dtos/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll({
    page = 1,
    limit = 10,
    sortBy = 'createdAt.desc',
    search = '',
  }: {
    page: number;
    limit: number;
    sortBy: string;
    search?: string;
  }) {
    const countPage = await this.prismaService.products.count({
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            idProductProvider: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    const orderBy = {
      [sortBy.split('.')[0]]: sortBy.split('.')[1],
    };

    const getProducts = await this.prismaService.products.findMany({
      take: Number(limit),
      skip: (page - 1) * limit,
      orderBy: {
        ...orderBy,
      },
      include: {
        productGroup: {
          select: {
            name: true,
          },
        },
      },
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            idProductProvider: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      statusCode: 200,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPage: Math.ceil(countPage / limit),
        totalData: countPage,
      },
      data: getProducts,
    };
  }

  async findById(id: string) {
    try {
      return await this.prismaService.products.findUnique({
        where: {
          id,
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async create(_data: CreateProductDto) {
    const price: number =
      _data.priceFromProvider +
      _data.profit +
      _data.priceFromProvider * (_data.profitInPercent / 100);

    const resellerPrice: number =
      _data.priceFromProvider +
      _data.profitReseller +
      _data.priceFromProvider * (_data.profitResellerInPercent / 100);

    const productGroupId = _data.productGroupId;
    delete _data.productGroupId;

    const data: Prisma.ProductsCreateInput = {
      ..._data,
      price,
      resellerPrice,
      productGroup: {
        connect: {
          id: productGroupId,
        },
      },
    };

    return await this.prismaService.products.create({
      data,
    });
  }

  async update(id: string, _data: UpdateProductDto) {
    const isPriceThere =
      _data.priceFromProvider && (_data.profit || _data.profitInPercent)
        ? true
        : false;
    const isResellerPriceThere =
      _data.priceFromProvider &&
      _data.profitReseller &&
      _data.profitResellerInPercent
        ? true
        : false;

    // console.log(
    //   'isPriceThere',
    //   isPriceThere,
    //   _data.priceFromProvider,
    //   _data.profit,
    //   _data.profitInPercent,
    // );

    const price: number =
      _data.priceFromProvider +
      _data.profit +
      _data.priceFromProvider * (_data.profitInPercent / 100);

    console.log('price', price);

    const resellerPrice: number =
      _data.priceFromProvider +
      _data.profitReseller +
      _data.priceFromProvider * (_data.profitResellerInPercent / 100);

    const data: Prisma.ProductsUpdateInput = {
      ..._data,
      ...(isPriceThere && { price }),
      ...(isResellerPriceThere && { resellerPrice }),
    };

    try {
      return await this.prismaService.products.update({
        where: {
          id,
        },
        data,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async delete(id: string) {
    try {
      return await this.prismaService.products.delete({
        where: {
          id,
        },
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
