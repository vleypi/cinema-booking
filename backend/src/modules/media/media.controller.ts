import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '@/common/validation/parse-id.pipe.js';
import { MEDIA_CACHE_CONTROL } from '@/modules/media/media.constant.js';
import { MediaService } from '@/modules/media/media.service.js';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get(':id')
  @Header('Cache-Control', MEDIA_CACHE_CONTROL)
  @ApiOkResponse({ description: 'Содержимое файла, например постер фильма' })
  @ApiNotFoundResponse()
  async find(@Param('id', ParseIdPipe) id: string): Promise<StreamableFile> {
    const { file, stream } = await this.media.open(id);

    return new StreamableFile(stream, { type: file.mimeType, length: file.sizeBytes });
  }
}
