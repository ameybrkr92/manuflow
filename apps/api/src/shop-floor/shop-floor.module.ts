import { Module } from '@nestjs/common';
import { ShopFloorService } from './shop-floor.service';
import { ShopFloorController } from './shop-floor.controller';

@Module({
  controllers: [ShopFloorController],
  providers: [ShopFloorService],
  exports: [ShopFloorService],
})
export class ShopFloorModule {}
