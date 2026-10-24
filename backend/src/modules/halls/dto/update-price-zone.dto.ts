import { PartialType } from '@nestjs/swagger';
import { CreatePriceZoneDto } from '@/modules/halls/dto/create-price-zone.dto.js';

export class UpdatePriceZoneDto extends PartialType(CreatePriceZoneDto) {}
