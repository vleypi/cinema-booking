import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { invalidField } from '@/common/validation/validation-errors.js';
import type { ReplaceTimeBandsDto } from '@/modules/time-bands/dto/replace-time-bands.dto.js';
import { TimeBand } from '@/modules/time-bands/entities/time-band.entity.js';
import { buildTimeBands, coversDayStart } from '@/modules/time-bands/time-band-schedule.js';
import { TIME_BAND_MESSAGES } from '@/modules/time-bands/time-bands.constant.js';

@Injectable()
export class TimeBandsService {
  constructor(@InjectRepository(TimeBand) private readonly timeBands: Repository<TimeBand>) {}

  findByCinema(cinemaId: string): Promise<TimeBand[]> {
    return this.timeBands.find({ where: { cinemaId }, order: { startsAt: 'ASC' } });
  }

  async replace(cinemaId: string, { bands }: ReplaceTimeBandsDto): Promise<TimeBand[]> {
    if (!coversDayStart(bands)) throw invalidField('bands', TIME_BAND_MESSAGES.dayStartMissing);

    await this.timeBands.manager.transaction(async (manager) => {
      await manager.delete(TimeBand, { cinemaId });
      await manager.insert(TimeBand, buildTimeBands(cinemaId, bands));
    });

    return this.findByCinema(cinemaId);
  }
}
