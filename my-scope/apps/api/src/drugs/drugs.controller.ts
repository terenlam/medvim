import { Controller, Get, Query } from '@nestjs/common';
import { DrugsService } from './drugs.service';

@Controller('drugs')
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) { }

  @Get('search')
  search(@Query('q') q: string) {
    return this.drugsService.search(q);
  }
}
