import { Module } from '@nestjs/common';
import { FilePickerService } from './file-picker.service';
import { FilePickerController } from './file-picker.controller';

@Module({
  providers: [FilePickerService],
  controllers: [FilePickerController],
})
export class FilePickerModule {}
