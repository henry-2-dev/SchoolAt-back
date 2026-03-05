import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserPinnedSchool } from '../pinned_schools/pinned-schools.entity';
import { SchoolComment } from '../schools_comments/schools-comments.entity';
import { SchoolsPhotos } from '../schools_photos/schools-photos.entity';
import { SchoolPost } from '../schools_posts/schools-posts.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  clerkId: string;

  @Column()
  name: string;

  @Column()
  type: string; // primaire, secondaire, supérieur, formation

  @Column()
  status: string; // public / privé

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal')
  latitude: number;

  @Column('decimal')
  longitude: number;

  @Column()
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ nullable: true })
  coverPhoto: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany(() => SchoolPost, (post) => post.school)
  posts: SchoolPost[];

  @OneToMany(() => SchoolsPhotos, (photo) => photo.school)
  photos: SchoolsPhotos[];

  @OneToMany(() => SchoolComment, (comment) => comment.school)
  comments: SchoolComment[];

  @OneToMany(() => UserPinnedSchool, (pin) => pin.school)
  pinnedBy: UserPinnedSchool[];
}
