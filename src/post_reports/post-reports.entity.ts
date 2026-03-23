import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SchoolPost } from '../schools_posts/schools-posts.entity';
import { User } from '../users/user.entity';

@Entity('post_reports')
export class PostReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  reason: string;

  @Column('text', { nullable: true })
  details: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SchoolPost, { onDelete: 'CASCADE' })
  post: SchoolPost;

  @CreateDateColumn()
  createdAt: Date;
}
