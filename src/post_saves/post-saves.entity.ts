import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { SchoolPost } from '../schools_posts/schools-posts.entity';
import { User } from '../users/user.entity';

@Entity('post_saves')
export class PostSave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.postSaves, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SchoolPost, (post) => post.saves, { onDelete: 'CASCADE' })
  post: SchoolPost;

  @CreateDateColumn()
  createdAt: Date;
}
