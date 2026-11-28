import { ApiProperty } from '@nestjs/swagger';

export class CustomerProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: String, nullable: true })
  name: string | null;

  @ApiProperty({ type: String, nullable: true })
  phone: string | null;

  @ApiProperty({ type: Date, nullable: true })
  emailVerifiedAt: Date | null;
}
