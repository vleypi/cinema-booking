import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsNotEmpty, IsNumberString, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/common/security/password.js';
import { STAFF_FULL_NAME_MAX_LENGTH, STAFF_MESSAGES } from '@/modules/staff/staff.constant.js';
import { LOGIN_MAX_LENGTH, LOGIN_PATTERN, normalizeLogin } from '@/modules/staff/staff-login.js';
import { StaffRole } from '@/modules/staff/staff-role.enum.js';

export class CreateStaffDto {
  @ApiProperty({ example: 'ivanova', pattern: LOGIN_PATTERN.source })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? normalizeLogin(value) : value))
  @IsString()
  @Matches(LOGIN_PATTERN, { message: STAFF_MESSAGES.loginFormat })
  @MaxLength(LOGIN_MAX_LENGTH)
  login: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH, description: 'Временный пароль, сотрудник сменит его при первом входе' })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;

  @ApiProperty({ example: 'Иванова Анна Сергеевна' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(STAFF_FULL_NAME_MAX_LENGTH)
  fullName: string;

  @ApiProperty({ enum: StaffRole, enumName: 'StaffRole' })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiProperty({ type: [String], example: ['1'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsNumberString({ no_symbols: true }, { each: true })
  cinemaIds: string[];
}
