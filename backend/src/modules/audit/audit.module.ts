import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from '@/modules/audit/audit.controller.js';
import { AuditService } from '@/modules/audit/audit.service.js';
import { AuditLog } from '@/modules/audit/entities/audit-log.entity.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
