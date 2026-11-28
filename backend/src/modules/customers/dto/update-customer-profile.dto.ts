import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CUSTOMER_NAME_MAX_LENGTH, CUSTOMER_PHONE_MAX_LENGTH } from '@/modules/orders/orders.constant.js';

const trimOptional = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ type: String, nullable: true, example: 'Иван Петров' })
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(CUSTOMER_NAME_MAX_LENGTH)
  name?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '+79991234567' })
  @IsOptional()
  @Transform(trimOptional)
  @IsString()
  @MaxLength(CUSTOMER_PHONE_MAX_LENGTH)
  phone?: string | null;
}
