import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { PostType } from '../common/enums/post_type.enum';
import { School } from '../schools/schools.entity';
import { PostMedia } from '../post_media/post-media.entity';
import { PostComment } from '../post_comments/post-comments.entity';
import { PostShare } from '../post_shares/post-shares.entity';

@Entity('school_posts')
export class SchoolPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PostType })
  type: PostType;

  @Column('text')
  content: string;

  @Column('text')
  description: string;

  @ManyToOne(() => School, (school) => school.posts, { onDelete: 'CASCADE' })
  school: School;

  @Column()
  schoolId: string;

  @OneToMany(() => PostMedia, (media) => media.post, { cascade: true })
  media: PostMedia[];

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  @OneToMany(() => PostShare, (share) => share.post)
  shares: PostShare[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  saves: number;
}
