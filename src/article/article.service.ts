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
import { FollowEntity } from 'src/profile/entity/follow.entity';
import { TagsEntity } from 'src/tag/entities/tag.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    @InjectRepository(TagsEntity)
    private readonly tagRepository: Repository<TagsEntity>,
  ) {}

  async create(user: UserEntity, articleDto: CreateArticleDto) {
    const { tags = [], ...articleData } = articleDto;

    const article = this.articleRepository.create(articleData);
    article.slug = this.generateSlug(article.title);
    article.author = user;

    //check for existing tags since am not storing duplicates also creating new tags
    if (tags.length) {
      const tagEntities: TagsEntity[] = [];

      for (const tagName of tags) {
        const existingTag = await this.tagRepository.findOne({
          where: { name: tagName },
        });

        if (existingTag) {
          tagEntities.push(existingTag);
        } else {
          const newTag = this.tagRepository.create({ name: tagName });
          const savedTag = await this.tagRepository.save(newTag);
          tagEntities.push(savedTag);
        }
      }

      article.tags = tagEntities;
    }

    const newArticle = await this.articleRepository.save(article);

    return this.generateArticleResponse(newArticle);
  }

  async getAll(query: QueryArticleDto, userId: number) {
    //could have used relation in find method but need to filter data
    //i want not only the result i also want to filter all articles so i go for querybuilder
    const queryBuidler = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .leftJoinAndSelect('articles.tags', 'tags');

    if (query.tag) {
      queryBuidler.andWhere('tags.name ILIKE :tag', {
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

    if (query.favorited) {
      const userWithFavorites = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      if (!userWithFavorites || userWithFavorites.favorites.length === 0) {
        throw new NotFoundException('You dont have any favorite articles');
      }

      const favoriteIds = userWithFavorites?.favorites.map(
        (articles) => articles.id,
      );
      queryBuidler.andWhere('articles.id IN (:...ids)', { ids: favoriteIds });
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

    let userFavoriteIds: number[] = [];

    if (userId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favorites'],
      });

      userFavoriteIds = currentUser
        ? currentUser.favorites.map((article) => article.id)
        : [];
    }

    const articlesWithFavorite = articles.map((article) => {
      const favorited = userFavoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorite, articlesCount };
  }

  async getFeed(userId: number, query: QueryArticleDto) {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
    });

    if (!follows || follows.length === 0) {
      return {
        articles: [],
        articlesCount: 0,
        message: 'You are not following anyone yet.',
      };
    }

    const followingIds = follows.map((follow) => follow.followingId);

    const queryBuidler = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC');

    queryBuidler.andWhere('articles.authorId IN (:...followingIds)', {
      followingIds: followingIds,
    });

    const articleCount = await queryBuidler.getCount();

    if (query.limit) queryBuidler.limit(query.limit);

    if (query.offset) queryBuidler.offset(query.offset);

    const articles = await queryBuidler.getMany();

    if (articles.length === 0) {
      return {
        articles: [],
        articleCount,
        message:
          "No articles available — the people you follow haven't posted yet.",
      };
    }

    return { articles, articleCount };
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

  async dislike(userId: number, slug: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    if (!user) {
      throw new NotFoundException(`did find user with this ${userId} id`);
    }
    const currentArticle = await this.findBySlug(slug);

    const articleIndex = user.favorites.findIndex(
      (article) => article.slug === currentArticle.slug,
    );
    if (articleIndex >= 0) {
      //ensures favorite count never goes below zero also decrementing it
      currentArticle.favoritesCount = Math.max(
        currentArticle.favoritesCount - 1,
        0,
      );
      user.favorites.splice(articleIndex, 1);
      await this.articleRepository.save(currentArticle);
      await this.userRepository.save(user);
    }
    return this.generateArticleResponse(currentArticle);
  }
}
