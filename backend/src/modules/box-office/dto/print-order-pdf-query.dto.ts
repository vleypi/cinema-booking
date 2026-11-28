import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const PRINTABLE_PDF_FORMATS = ['a4', 'receipt'] as const;
export type PrintablePdfFormat = (typeof PRINTABLE_PDF_FORMATS)[number];

export class PrintOrderPdfQueryDto {
  @ApiPropertyOptional({ enum: PRINTABLE_PDF_FORMATS, default: 'a4' })
  @IsOptional()
  @IsIn(PRINTABLE_PDF_FORMATS)
  format?: PrintablePdfFormat;
}
