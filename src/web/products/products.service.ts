import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dtos/product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.products.findMany();
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
    const price: number =
      _data.priceFromProvider +
      _data.profit +
      _data.priceFromProvider * (_data.profitInPercent / 100);

    const resellerPrice: number =
      _data.priceFromProvider +
      _data.profitReseller +
      _data.priceFromProvider * (_data.profitResellerInPercent / 100);

    const data: Prisma.ProductsCreateInput = {
      ..._data,
      price,
      resellerPrice,
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
