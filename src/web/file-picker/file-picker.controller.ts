import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilePickerService } from './file-picker.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from 'src/common/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileUploadValidationPipe } from 'src/common/file-upload.validation';
import { Role } from '@prisma/client';

@ApiTags('File Picker')
@ApiSecurity('access-token')
@Controller('admin/file-picker')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilePickerController {
  constructor(private readonly filePickerService: FilePickerService) {}

  @Get('list')
  @Roles([Role.ADMIN])
  async listFiles(@Res() res: Response) {
    const getList = await this.filePickerService.getAllFiles();

    if (!getList) {
      throw new BadRequestException("Can't get list of files");
    }

    return res.json({
      statusCode: 200,
      message: 'List of files',
      data: getList,
    });
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload')
  @Roles([Role.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Res() res: Response,
    @UploadedFile(new FileUploadValidationPipe())
    file: Express.Multer.File,
  ) {
    const upload = await this.filePickerService.uploadFile(file);

    if (!upload) {
      throw new BadRequestException("Can't upload file");
    }

    return res.json({
      statusCode: 200,
      message: 'File uploaded',
    });
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
    },
  })
  @Post('delete')
  @Roles([Role.ADMIN])
  async deleteFile(@Body() body: { id: string }, @Res() res: Response) {
    console.log(body);
    if (!body.id) throw new BadRequestException('Id is required');
    const deleteFile = await this.filePickerService.deleteFile(body);

    if (!deleteFile) {
      throw new BadRequestException("Can't delete file");
    }

    return res.json({
      statusCode: 200,
      message: 'File deleted',
    });
  }
}
