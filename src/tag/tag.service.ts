import { Injectable, NotFoundException } from '@nestjs/common';
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

    return this.generateTagsResponses(allTags);
  }

  async getTagName(slug: string) {
    const findTagName = await this.tagRepository.find({
      where: { name: slug },
      relations: ['articles'],
    });
    if (!findTagName) {
      throw new NotFoundException('This tag name was not found');
    }
    return this.generateTagsResponses(findTagName);
  }

  generateTagsResponses(tags: TagsEntity[]) {
    return { tags };
  }
  generateTagsResponse(tags: TagsEntity) {
    return { tags };
  }
}
