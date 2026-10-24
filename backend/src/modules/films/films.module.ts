import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from '@/modules/films/entities/film.entity.js';
import { FilmsController } from '@/modules/films/films.controller.js';
import { FilmsService } from '@/modules/films/films.service.js';
import { MediaModule } from '@/modules/media/media.module.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Session]), MediaModule],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
