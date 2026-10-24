import { randomUUID } from 'node:crypto';
import { createReadStream, type ReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { EnvironmentVariables } from '@/config/environment.js';
import { MediaFile } from '@/modules/media/entities/media-file.entity.js';
import { MEDIA_MESSAGES } from '@/modules/media/media.constant.js';

export interface IUploadedFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export interface IMediaContent {
  file: MediaFile;
  stream: ReadStream;
}

@Injectable()
export class MediaService {
  readonly #directory: string;

  constructor(
    @InjectRepository(MediaFile) private readonly mediaFiles: Repository<MediaFile>,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.#directory = resolve(config.get('MEDIA_DIR', { infer: true }));
  }

  async save({ buffer, mimetype, size }: IUploadedFile): Promise<MediaFile> {
    const storageKey = randomUUID();
    await mkdir(this.#directory, { recursive: true });
    await writeFile(this.#pathOf(storageKey), buffer);

    return this.mediaFiles.save(this.mediaFiles.create({ storageKey, mimeType: mimetype, sizeBytes: size }));
  }

  async open(id: string): Promise<IMediaContent> {
    const file = await this.mediaFiles.findOneBy({ id });
    if (!file) throw new NotFoundException(MEDIA_MESSAGES.notFound);

    return { file, stream: createReadStream(this.#pathOf(file.storageKey)) };
  }

  async remove(id: string): Promise<void> {
    const file = await this.mediaFiles.findOneBy({ id });
    if (!file) return;

    await this.mediaFiles.delete({ id });
    await rm(this.#pathOf(file.storageKey), { force: true });
  }

  #pathOf(storageKey: string): string {
    return join(this.#directory, storageKey);
  }
}
