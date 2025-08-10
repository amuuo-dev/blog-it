import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { JwtGuard } from 'src/user/guard/jwt-guard';
import { User } from 'src/user/decorator/user.decorator';
import { UserEntity } from 'src/user/entity/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtGuard)
  async create(
    @User() user: UserEntity,
    @Body() createdArticle: CreateArticleDto,
  ) {
    return await this.articleService.create(user, createdArticle);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const article = await this.articleService.getOne(slug);
    return this.articleService.generateArticleResponse(article);
  }
  @Delete(':slug')
  @UseGuards(JwtGuard)
  async remove(@Param('slug') slug: string, @User('id') userId: number) {
    return await this.articleService.delete(slug, userId);
  }
  @Patch(':slug')
  @UseGuards(JwtGuard)
  async updateArticle(
    @Param('slug') slug: string,
    @Body() updateArticle: UpdateArticleDto,
    @User('id') userId: number,
  ) {
    const updatedArticle = await this.articleService.update(
      slug,
      updateArticle,
      userId,
    );
    return this.articleService.generateArticleResponse(updatedArticle);
  }
}
