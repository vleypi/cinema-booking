import { PickType } from '@nestjs/swagger';
import { CinemaDto } from '@/modules/cinemas/dto/cinema.dto.js';

export class CatalogCinemaDto extends PickType(CinemaDto, ['id', 'name', 'slug', 'address', 'timezone', 'opensAt', 'closesAt']) {}
