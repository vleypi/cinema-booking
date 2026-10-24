import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaFile } from '@/modules/media/entities/media-file.entity.js';
import { MediaController } from '@/modules/media/media.controller.js';
import { MediaService } from '@/modules/media/media.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([MediaFile])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
