import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileUploadValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File) {
    const mime = value.mimetype;

    const MIME_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/mpeg',
      'video/ogg',
      'video/quicktime',
      'video/webm',
      'video/x-msvideo',
      'video/x-flv',
      'video/x-ms-wmv',
      'video/3gpp',
      'video/3gpp2',
    ];

    const maxImageSize = 1024 * 1024 * 5; // 5MB
    const maxVideoSize = 1024 * 1024 * 50; // 50MB
    const maxFileSize = mime.includes('image') ? maxImageSize : maxVideoSize;

    if (!MIME_TYPES.includes(mime ?? null)) {
      throw new BadRequestException(
        'File  not supported. Supported file types: jpg, jpeg, png, webp, gif, pdf, doc, docx, xls, xlsx, ppt, pptx, mp4, mpeg, ogg, qt, webm, avi, flv, wmv, 3gp, 3g2',
      );
    }

    if (value.size > maxFileSize) {
      throw new BadRequestException(
        `File size too large. Max file size: ${maxFileSize / 1024 / 1024}MB`,
      );
    }

    return value;
  }
}
