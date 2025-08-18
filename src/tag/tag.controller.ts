import { Controller, Get, Param } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll() {
    return await this.tagService.getAll();
  }
  @Get(':slug')
  async getOneTag(@Param('slug') slug: string) {
    return await this.tagService.getTagName(slug);
  }
}
