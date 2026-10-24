import { StrictPartialType } from '@/common/validation/strict-partial.js';
import { CreateFilmDto } from '@/modules/films/dto/create-film.dto.js';

export class UpdateFilmDto extends StrictPartialType(CreateFilmDto) {}
