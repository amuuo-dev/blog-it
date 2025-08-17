import { TagsEntity } from '../../tag/entities/tag.entity';
import { CommentEntity } from '../../comment/entity/comment.entity';
import { UserEntity } from '../../user/entity/user.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'articles' })
export class ArticleEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  // @Column('simple-array')
  // tagList: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  favoritesCount: number;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.articles)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.article)
  comments: CommentEntity[];

  @ManyToMany(() => TagsEntity, (tag) => tag.articles, { cascade: true })
  @JoinTable({ name: 'article_tags' })
  tags: TagsEntity[];
}
