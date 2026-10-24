import { StrictPartialType } from '@/common/validation/strict-partial.js';
import { CreateCinemaDto } from '@/modules/cinemas/dto/create-cinema.dto.js';

export class UpdateCinemaDto extends StrictPartialType(CreateCinemaDto) {}
