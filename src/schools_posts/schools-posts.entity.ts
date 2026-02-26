import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PostType } from '../common/enums/post_type.enum';
import { PostComment } from '../post_comments/post-comments.entity';
import { PostMedia } from '../post_media/post-media.entity';
import { PostSave } from '../post_saves/post-saves.entity';
import { PostShare } from '../post_shares/post-shares.entity';
import { School } from '../schools/schools.entity';

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

  @OneToMany(() => PostSave, (save) => save.post)
  saves: PostSave[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  views: number;
}
