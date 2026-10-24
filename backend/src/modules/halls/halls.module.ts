import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { PriceZone } from '@/modules/halls/entities/price-zone.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { HallsController } from '@/modules/halls/halls.controller.js';
import { HallsService } from '@/modules/halls/halls.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, PriceZone, HallLayout, Seat])],
  controllers: [HallsController],
  providers: [HallsService],
})
export class HallsModule {}
