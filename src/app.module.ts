import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './web/users/users.module';
import { ProductsModule } from './web/products/products.module';
import { ServicesModule } from './web/services/services.module';
import { FilePickerModule } from './web/file-picker/file-picker.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    ServicesModule,
    FilePickerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
