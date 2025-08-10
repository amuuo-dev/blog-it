import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UserEntity } from 'src/user/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async create(user: UserEntity, articleDto: CreateArticleDto) {
    const article = this.articleRepository.create(articleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.generateSlug(article.title);
    article.author = user;

    const newArticle = await this.articleRepository.save(article);
    return this.generateArticleResponse(newArticle);
  }

  generateArticleResponse(article: ArticleEntity) {
    return { article };
  }

  generateSlug(title: string) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    return `${slugify(title, { lower: true })}-${id}`;
  }

  async findBySlug(slug: string) {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });
    if (!article)
      throw new NotFoundException('article with that slug not found!');

    return article;
  }

  async getOne(slug: string) {
    return await this.findBySlug(slug);
  }

  async delete(slug: string, userId: number) {
    const article = await this.findBySlug(slug);

    if (article.authorId !== userId) {
      throw new UnauthorizedException('You are not the owner of the article!');
    }
    const result = await this.articleRepository.delete({ slug });
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID ${slug} not found`);
    }
    return 'Article deleted successfully';
  }

  async update(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ) {
    const article = await this.findBySlug(slug);
    if (article.authorId !== userId) {
      throw new UnauthorizedException('You are not the owner of the article!');
    }

    if (updateArticleDto.title) {
      article.slug = this.generateSlug(updateArticleDto.title);
    }
    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }
}
