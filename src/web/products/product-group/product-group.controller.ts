import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { ProductGroupService } from './product-group.service';
import { Request, Response } from 'express';
import {
  createProductGroupDto,
  deleteProductGroupDto,
  updateProductGroupDto,
} from './dtos/product-group.dto';
import { Role } from '@prisma/client';

@ApiTags('Admin product-group')
@ApiSecurity('access-token')
@Controller('admin/product/product-group')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductGroupController {
  constructor(private readonly productGroupService: ProductGroupService) {}

  @Get()
  @Roles([Role.ADMIN])
  async getProductGroup(
    @Req() req: Request,
    @Query()
    query: {
      page: number;
      limit: number;
      sortBy: string;
      search: string;
    },
  ) {
    const productGroup = await this.productGroupService.findAll(query);

    if (!productGroup) {
      throw new BadRequestException('Error getting product group');
    }

    return productGroup;
  }

  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  @Roles([Role.ADMIN])
  async getProductGroupById(@Req() req: Request, @Res() res: Response) {
    if (!req.params.id) {
      throw new BadRequestException('Param id is required');
    }

    const productGroup = await this.productGroupService.findById(req.params.id);

    if (!productGroup) {
      throw new BadRequestException('Error getting product group');
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Product Group get successfully',
      data: productGroup,
    });
  }

  @Post('create')
  @Roles([Role.ADMIN])
  async createProductGroup(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: createProductGroupDto,
  ) {
    const create = await this.productGroupService.create(data);

    if (!create) {
      throw new BadRequestException('Error creating product group');
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Product Group created successfully',
      data: create,
    });
  }

  @Post('update')
  @Roles([Role.ADMIN])
  async updateProductGroup(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: updateProductGroupDto,
  ) {
    const update = await this.productGroupService.update(data.id, data);

    if (!update) {
      throw new BadRequestException('Error updating product group');
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Product Group updated successfully',
      data: update,
    });
  }

  @Post('delete')
  @Roles([Role.ADMIN])
  async deleteProductGroup(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: deleteProductGroupDto,
  ) {
    const deleteProductGroup = await this.productGroupService.delete(data.id);

    if (!deleteProductGroup) {
      throw new BadRequestException('Error deleting product group');
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Product Group deleted successfully',
      data: deleteProductGroup,
    });
  }
}
