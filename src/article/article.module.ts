import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { UserModule } from 'src/user/user.module';
import { UserEntity } from 'src/user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity]), UserModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
