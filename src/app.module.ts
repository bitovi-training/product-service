import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AuthModule } from '@bitovi-training/auth-middleware';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
