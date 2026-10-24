import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cinema } from '@/modules/cinemas/entities/cinema.entity.js';
import { Film } from '@/modules/films/entities/film.entity.js';
import { Session } from '@/modules/sessions/entities/session.entity.js';
import { SessionsController } from '@/modules/sessions/sessions.controller.js';
import { SessionsService } from '@/modules/sessions/sessions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Cinema, Film])],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
