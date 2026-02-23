import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { SchoolPost } from '../schools_posts/schools-posts.entity';
import { SchoolsPhotos } from '../schools_photos/schools-photos.entity';
import { SchoolComment } from '../schools_comments/schools-comments.entity';
import { UserPinnedSchool } from '../pinned_schools/pinned-schools.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  supabaseId: string;

  @Column()
  name: string;

  @Column()
  type: string; // primaire, secondaire, supérieur, formation

  @Column()
  status: string; // public / privé

  @Column('text')
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
