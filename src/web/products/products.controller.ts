import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Request, Response } from 'express';
import {
  CreateProductDto,
  DeleteProductDto,
  UpdateProductDto,
} from './dtos/product.dto';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Admin Products')
@ApiSecurity('access-token')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  @Roles(['ADMIN'])
  async getProducts(@Req() req: Request, @Res() res: Response) {
    const products = await this.productService.findAll();

    if (!products) {
      throw new BadRequestException('Error getting products');
    }

    return res.status(200).json({
      message: 'Products get successfully',
      data: products,
    });
  }

  @Post('create')
  @Roles(['ADMIN'])
  async createProduct(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: CreateProductDto,
  ) {
    const create = await this.productService.create(data);

    if (!create) {
      throw new BadRequestException('Error creating product');
    }
    return res.status(201).json({
      message: 'Product created successfully',
      data: create,
    });
  }

  @Post('update')
  @Roles(['ADMIN'])
  async updateProducts(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: UpdateProductDto,
  ) {
    const update = await this.productService.update(data.id, data);

    if (!update) {
      throw new BadRequestException('Error updating product');
    }

    return res.status(200).json({
      message: 'Product updated successfully',
      data: update,
    });
  }

  @Post('delete')
  @Roles(['ADMIN'])
  async deleteProduct(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: DeleteProductDto,
  ) {
    const { id } = data;

    if (!id) {
      throw new BadRequestException('Product id is required');
    }

    const deleteProduct = await this.productService.delete(id);
    if (!deleteProduct) {
      throw new BadRequestException('Error deleting product');
    }

    return res.status(200).json({
      message: 'Product deleted successfully',
      data: deleteProduct,
    });
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  @Roles(['ADMIN'])
  async getProductById(@Req() req: Request, @Res() res: Response) {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestException('Product id is required');
    }

    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return res.status(200).json({
      message: 'Product get successfully',
      data: product,
    });
  }
}
