import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtGuard } from 'src/user/guard/jwt-guard';
import { User } from 'src/user/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('articles')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':slug/comments')
  @UseGuards(JwtGuard)
  async createComment(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body() createComment: CreateCommentDto,
  ) {
    return await this.commentService.create(createComment, slug, userId);
  }
  @Get(':slug/comments')
  async getAllCommentsFromPost(@Param('slug') slug: string) {
    return await this.commentService.getAllComments(slug);
  }
  @Delete(':slug/comments/:id')
  @UseGuards(JwtGuard)
  async deleteComment(
    @Param('slug') slug: string,
    @User('id') userId: number,
    @Param('id') commentId: number,
  ) {
    return await this.commentService.delete(userId, slug, commentId);
  }
}
