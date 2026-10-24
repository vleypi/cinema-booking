import { ApiProperty } from '@nestjs/swagger';
import { CreateFilmDto } from '@/modules/films/dto/create-film.dto.js';

export class FilmDto extends CreateFilmDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ type: String, nullable: true, example: '1', description: 'Постер отдается по адресу /api/media/{posterFileId}' })
  posterFileId: string | null;
}
