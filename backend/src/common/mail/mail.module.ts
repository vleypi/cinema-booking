import { Global, Module } from '@nestjs/common';
import { MailService } from '@/common/mail/mail.service.js';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
