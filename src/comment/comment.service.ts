import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ArticleEntity } from 'src/article/entity/article.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createComment: CreateCommentDto, slug: string, userId: number) {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });

    if (!article) throw new NotFoundException('Article not found');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const comment = this.commentRepository.create({
      ...createComment,
      article,
      author: instanceToPlain(user),
    });
    const savedComment = await this.commentRepository.save(comment);
    return this.generateCommentResponse(savedComment);
  }

  async getAllComments(slug: string) {
    const article = await this.articleRepository.findOneBy({ slug });
    if (!article) throw new NotFoundException('Article not found');
    const comments = await this.commentRepository.find({
      where: { articleId: article.id },
      order: { createdAt: 'DESC' },
    });
    if (!comments.length) {
      return 'No Comments yet on this post';
    }
    return this.generateCommentsResponse(comments);
  }

  generateCommentResponse(comment: CommentEntity) {
    return {
      comment,
    };
  }

  generateCommentsResponse(comments: CommentEntity[]) {
    return {
      comments,
    };
  }
}
