import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, Equals, IsArray, IsBoolean, IsEmail, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';
import { CUSTOMER_NAME_MAX_LENGTH, CUSTOMER_PHONE_MAX_LENGTH, MAX_ONLINE_TICKETS, ORDER_MESSAGES } from '@/modules/orders/orders.constant.js';

const trimString = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateOrderDto {
  @ApiProperty({ example: '1' })
  @IsNumberString({ no_symbols: true })
  sessionId: string;

  @ApiProperty({ type: [String], minItems: 1, maxItems: MAX_ONLINE_TICKETS, example: ['10', '11'] })
  @IsArray()
  @ArrayMinSize(1, { message: ORDER_MESSAGES.minTicketsRequired })
  @ArrayMaxSize(MAX_ONLINE_TICKETS, { message: ORDER_MESSAGES.maxTicketsExceeded })
  @ArrayUnique({ message: ORDER_MESSAGES.duplicateSeats })
  @IsNumberString({ no_symbols: true }, { each: true })
  seatIds: string[];

  @ApiProperty({ example: 'viewer@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Иван Петров' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(CUSTOMER_NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional({ example: '+79991234567' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(CUSTOMER_PHONE_MAX_LENGTH)
  phone?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ageConfirmed?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @Equals(true, { message: ORDER_MESSAGES.privacyRequired })
  privacyAccepted: boolean;
}
