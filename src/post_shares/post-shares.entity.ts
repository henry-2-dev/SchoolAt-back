import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { SchoolPost } from '../schools_posts/schools-posts.entity';

@Entity('post_shares')
export class PostShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.postShares, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SchoolPost, (post) => post.shares, { onDelete: 'CASCADE' })
  post: SchoolPost;

  @CreateDateColumn()
  createdAt: Date;
}
