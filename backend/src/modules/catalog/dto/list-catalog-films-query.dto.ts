import { PickType } from '@nestjs/swagger';
import { SearchQueryDto } from '@/common/pagination/list-query.dto.js';

export class ListCatalogFilmsQueryDto extends PickType(SearchQueryDto, ['search']) {}
