import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleService {
  create() {
    return 'article created successfully';
  }
}
