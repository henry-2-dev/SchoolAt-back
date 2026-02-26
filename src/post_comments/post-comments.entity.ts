import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SchoolPost } from '../schools_posts/schools-posts.entity';
import { User } from '../users/user.entity';

@Entity('post_comments')
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.postComments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SchoolPost, (post) => post.comments, { onDelete: 'CASCADE' })
  post: SchoolPost;

  @CreateDateColumn()
  createdAt: Date;
}
