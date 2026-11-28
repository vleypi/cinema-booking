import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsEmail, IsIn, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { BOX_OFFICE_PAYMENT_METHODS, type BoxOfficePaymentMethod } from '@/modules/box-office/box-office.constant.js';

const trimValue = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const normalizeEmail = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export class CreateBoxOfficeOrderDto {
  @ApiProperty()
  @IsNumberString()
  sessionId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsNumberString({}, { each: true })
  seatIds: string[];

  @ApiProperty({ enum: BOX_OFFICE_PAYMENT_METHODS })
  @IsIn(BOX_OFFICE_PAYMENT_METHODS)
  paymentMethod: BoxOfficePaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimValue)
  @IsString()
  @MaxLength(32)
  phone?: string;
}
