import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tags' })
export class TagsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @CreateDateColumn({ type: 'timestamp' })
  CreatedAt: Date;
}
