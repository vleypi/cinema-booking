import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { AuditLogDto, ListAuditLogsQueryDto } from '@/modules/audit/dto/audit-log.dto.js';
import { AuditLog } from '@/modules/audit/entities/audit-log.entity.js';

const AUDIT_LIST_LIMIT = 100;

export interface IRecordAuditParams {
  staffUserId: string;
  cinemaId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly logs: Repository<AuditLog>) {}

  async record(params: IRecordAuditParams): Promise<void> {
    await this.logs.save(
      this.logs.create({
        staffUserId: params.staffUserId,
        cinemaId: params.cinemaId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        before: params.before ?? null,
        after: params.after ?? null,
      }),
    );
  }

  async list(cinemaId: string, query: ListAuditLogsQueryDto): Promise<AuditLogDto[]> {
    const qb = this.logs
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.staffUser', 'staffUser')
      .where('log.cinemaId = :cinemaId', { cinemaId })
      .orderBy('log.createdAt', 'DESC')
      .addOrderBy('log.id', 'DESC')
      .take(AUDIT_LIST_LIMIT);

    if (query.staffUserId) {
      qb.andWhere('log.staffUserId = :staffUserId', { staffUserId: query.staffUserId });
    }
    if (query.entityType) {
      qb.andWhere('log.entityType = :entityType', { entityType: query.entityType });
    }
    if (query.from) {
      qb.andWhere('log.createdAt >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      const toDate = query.to.length === 10 ? new Date(`${query.to}T23:59:59.999Z`) : new Date(query.to);
      qb.andWhere('log.createdAt <= :to', { to: toDate });
    }

    const rows = await qb.getMany();

    return rows.map((row) => ({
      id: row.id,
      staffUserId: row.staffUserId,
      staffFullName: row.staffUser.fullName,
      cinemaId: row.cinemaId,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      before: row.before,
      after: row.after,
      createdAt: row.createdAt,
    }));
  }
}
