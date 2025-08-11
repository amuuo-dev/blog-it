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
import { QueryArticleDto } from './dto/query-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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

  async getAll(query: QueryArticleDto) {
    //could have used relation in find method but need to filter data
    //i want not only the result i also want to filter all articles so i go for querybuilder
    const queryBuidler = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuidler.andWhere('articles.tagList ILIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const authorIdFromUserName = await this.userRepository.findOne({
        where: { username: query.author },
      });

      if (!authorIdFromUserName) {
        throw new NotFoundException(`Author ${query.author} Not Found`);
      }

      //a bit confusing but here author is the alias in leftjoin and select
      queryBuidler.andWhere('author.id = :id', { id: authorIdFromUserName.id });
    }

    if (query.limit) {
      queryBuidler.limit(query.limit);
    }

    if (query.offset) {
      queryBuidler.offset(query.offset);
    }

    //latest article first ,,oldest last
    queryBuidler.orderBy('articles.createdAt', 'DESC');

    const [articles, articlesCount] = await queryBuidler.getManyAndCount();

    return { articles, articlesCount };
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

  async addToFavorite(userId: number, slug: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException(`did find user with this ${userId} id`);
    }

    const currentArticle = await this.findBySlug(slug);

    const isNotLiked = !user?.favorites.find(
      (article) => article.slug === currentArticle.slug,
    );

    if (isNotLiked) {
      user?.favorites.push(currentArticle);
      currentArticle.favoritesCount++;
      await this.articleRepository.save(currentArticle);
      await this.userRepository.save(user);
    }

    return this.generateArticleResponse(currentArticle);
  }
}
