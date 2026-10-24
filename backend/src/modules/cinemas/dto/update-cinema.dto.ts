import { PartialType } from '@nestjs/swagger';
import { CreateCinemaDto } from '@/modules/cinemas/dto/create-cinema.dto.js';

export class UpdateCinemaDto extends PartialType(CreateCinemaDto) {}
