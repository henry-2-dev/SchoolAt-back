import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { MediaType } from '../common/enums/media_type.enum';
import { SchoolPost } from '../schools_posts/schools-posts.entity';

@Entity('post_media')
export class PostMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column()
  mediaUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => SchoolPost, (post) => post.media, { onDelete: 'CASCADE' })
  post: SchoolPost;

  @CreateDateColumn()
  createdAt: Date;
}
