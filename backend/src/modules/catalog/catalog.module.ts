import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from '@/modules/catalog/catalog.controller.js';
import { CatalogService } from '@/modules/catalog/catalog.service.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { Film } from '@/modules/films/entities/film.entity.js';
import { HallLayout } from '@/modules/halls/entities/hall-layout.entity.js';
import { Hall } from '@/modules/halls/entities/hall.entity.js';
import { Seat } from '@/modules/halls/entities/seat.entity.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema, Film, Session, Hall, HallLayout, Seat, TimeBand])],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
