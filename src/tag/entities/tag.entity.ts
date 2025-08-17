import { ArticleEntity } from '../../article/entity/article.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tags' })
export class TagsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  name: string;
  @CreateDateColumn({ type: 'timestamp' })
  CreatedAt: Date;

  @ManyToMany(() => ArticleEntity, (article) => article.tags)
  articles: ArticleEntity[];
}
