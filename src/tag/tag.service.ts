import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsEntity } from './entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagsEntity)
    private readonly tagRepository: Repository<TagsEntity>,
  ) {}

  async getAll() {
    const allTags = await this.tagRepository.find();

    return this.generateTagsResponse(allTags);
  }
  generateTagsResponse(tags: TagsEntity[]) {
    return { tags };
  }
}
