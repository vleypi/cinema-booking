import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';

@Entity()
export class MediaFile extends BaseEntity {
  @Column({ unique: true })
  storageKey: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  sizeBytes: number;
}
