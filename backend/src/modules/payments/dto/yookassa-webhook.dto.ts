import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class YooKassaWebhookObjectDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class YooKassaWebhookDto {
  @IsString()
  @IsNotEmpty()
  event: string;

  @ValidateNested()
  @Type(() => YooKassaWebhookObjectDto)
  object: YooKassaWebhookObjectDto;
}
