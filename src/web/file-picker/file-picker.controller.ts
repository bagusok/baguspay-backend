import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilePickerService } from './file-picker.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from 'src/common/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileUploadValidationPipe } from 'src/common/file-upload.validation';

@ApiTags('File Picker')
@ApiSecurity('access-token')
@Controller('admin/file-picker')
@Roles(['ADMIN'])
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilePickerController {
  constructor(private readonly filePickerService: FilePickerService) {}

  @Get('list')
  async listFiles(@Res() res: Response) {
    const getList = await this.filePickerService.getAllFiles();

    if (!getList) {
      return new BadRequestException("Can't get list of files");
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Res() res: Response,
    @UploadedFile(new FileUploadValidationPipe())
    file: Express.Multer.File,
  ) {
    const upload = await this.filePickerService.uploadFile(file);

    if (!upload) {
      return new BadRequestException("Can't upload file");
    }

    return res.json({
      statusCode: 200,
      message: 'File uploaded',
    });
  }

  @ApiParam({
    name: 'key',
    description: 'File key',
  })
  @Get('delete/:key')
  async deleteFile(@Param('key') key: string, @Res() res: Response) {
    const deleteFile = await this.filePickerService.deleteFile(key);

    if (!deleteFile) {
      return new BadRequestException("Can't delete file");
    }

    return res.json({
      statusCode: 200,
      message: 'File deleted',
    });
  }
}
