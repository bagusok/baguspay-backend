import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
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
} from './dto/product-group.dto';

@ApiTags('Admin product-group')
@ApiSecurity('access-token')
@Controller('admin/product/product-group')
@Roles(['ADMIN'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductGroupController {
  constructor(private readonly productGroupService: ProductGroupService) {}

  @Get()
  async getProductGroup(@Req() req: Request, @Res() res: Response) {
    const productGroup = await this.productGroupService.findAll();

    if (!productGroup) {
      throw new BadRequestException('Error getting product group');
    }

    return res.status(200).json({
      message: 'Product Group get successfully',
      data: productGroup,
    });
  }

  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async getProductGroupById(@Req() req: Request, @Res() res: Response) {
    if (!req.params.id) {
      throw new BadRequestException('Param id is required');
    }

    const productGroup = await this.productGroupService.findById(req.params.id);

    if (!productGroup) {
      throw new BadRequestException('Error getting product group');
    }

    return res.status(200).json({
      message: 'Product Group get successfully',
      data: productGroup,
    });
  }

  @Post('create')
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
      message: 'Product Group created successfully',
      data: create,
    });
  }

  @Post('update')
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
      message: 'Product Group updated successfully',
      data: update,
    });
  }

  @Post('delete')
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
      message: 'Product Group deleted successfully',
      data: deleteProductGroup,
    });
  }
}
