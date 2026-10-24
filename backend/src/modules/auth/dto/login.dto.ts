import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH } from '@/common/security/password.js';
import { LOGIN_MAX_LENGTH } from '@/modules/staff/staff-login.js';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(LOGIN_MAX_LENGTH)
  login: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}
