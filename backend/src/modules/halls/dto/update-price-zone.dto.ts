import { StrictPartialType } from '@/common/validation/strict-partial.js';
import { CreatePriceZoneDto } from '@/modules/halls/dto/create-price-zone.dto.js';

export class UpdatePriceZoneDto extends StrictPartialType(CreatePriceZoneDto) {}
