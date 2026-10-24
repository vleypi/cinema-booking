import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CinemasController } from '@/modules/cinemas/cinemas.controller.js';
import { CinemasService } from '@/modules/cinemas/cinemas.service.js';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cinema])],
  controllers: [CinemasController],
  providers: [CinemasService],
})
export class CinemasModule {}
