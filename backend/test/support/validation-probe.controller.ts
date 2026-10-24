import { Body, Controller, Post } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';

export const VALIDATION_PROBE_PATH = 'validation-probe';

class ProbeItemDto {
  @IsInt()
  @Min(1)
  count: number;
}

export class ProbeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProbeItemDto)
  items: ProbeItemDto[];
}

@Controller(VALIDATION_PROBE_PATH)
export class ValidationProbeController {
  @Post()
  accept(@Body() body: ProbeDto): ProbeDto {
    return body;
  }
}
