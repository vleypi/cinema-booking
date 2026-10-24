import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';
import { TimeBandsController } from '@/modules/time-bands/time-bands.controller.js';
import { TimeBandsService } from '@/modules/time-bands/time-bands.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TimeBand])],
  controllers: [TimeBandsController],
  providers: [TimeBandsService],
})
export class TimeBandsModule {}
