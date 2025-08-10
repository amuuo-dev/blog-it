import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ArticleService } from './article.service';
import { JwtGuard } from 'src/user/guard/jwt-guard';
import { User } from 'src/user/decorator/user.decorator';
import { UserEntity } from 'src/user/entity/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';

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
}
