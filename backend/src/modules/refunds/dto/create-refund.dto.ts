import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { BOX_OFFICE_PAYMENT_METHODS, type BoxOfficePaymentMethod } from '@/modules/box-office/box-office.constant.js';

export class CreateCustomerRefundDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsNumberString({}, { each: true })
  ticketIds: string[];
}

export class CreateBoxOfficeRefundDto extends CreateCustomerRefundDto {
  @ApiPropertyOptional({ enum: BOX_OFFICE_PAYMENT_METHODS })
  @IsOptional()
  @IsIn(BOX_OFFICE_PAYMENT_METHODS)
  refundMethod?: BoxOfficePaymentMethod;
}

export class CreateTokenRefundDto extends CreateCustomerRefundDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RefundTokenQueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
