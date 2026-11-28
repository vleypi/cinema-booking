import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, Matches } from 'class-validator';
import { CUSTOMER_MESSAGES } from '@/modules/customers/customers.constant.js';

export class VerifyOtpDto {
  @ApiProperty({ example: 'viewer@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^\d{6}$/, { message: CUSTOMER_MESSAGES.invalidOtpFormat })
  code: string;
}
