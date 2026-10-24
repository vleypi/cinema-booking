import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity.js';
import { AgeRating } from '@/modules/films/age-rating.enum.js';
import { FilmStatus } from '@/modules/films/film-status.enum.js';
import { MediaFile } from '@/modules/media/entities/media-file.entity.js';

@Entity()
export class Film extends BaseEntity {
  @ManyToOne(() => MediaFile, { nullable: true })
  @JoinColumn({ name: 'posterFileId' })
  posterFile: Relation<MediaFile> | null;

  @Column({ type: 'bigint', nullable: true })
  posterFileId: string | null;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  genre: string;

  @Column({ type: 'enum', enum: AgeRating, enumName: 'age_rating' })
  ageRating: AgeRating;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ type: 'date' })
  releaseDate: string;

  @Column({ default: false })
  isPremiere: boolean;

  @Column({ type: 'varchar', nullable: true })
  trailerUrl: string | null;

  @Column({ type: 'enum', enum: FilmStatus, enumName: 'film_status' })
  status: FilmStatus;
}
