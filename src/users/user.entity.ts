import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { UserPinnedSchool } from '../pinned_schools/pinned-schools.entity';
import { PostComment } from '../post_comments/post-comments.entity';
import { PostSave } from '../post_saves/post-saves.entity';
import { PostShare } from '../post_shares/post-shares.entity';
import { SchoolComment } from '../schools_comments/schools-comments.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  supabaseId: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToMany(() => PostComment, (comment) => comment.user)
  postComments: PostComment[];

  @OneToMany(() => PostShare, (share) => share.user)
  postShares: PostShare[];

  @OneToMany(() => UserPinnedSchool, (pin) => pin.user)
  pinnedSchools: UserPinnedSchool[];

  @OneToMany(() => SchoolComment, (comment) => comment.user)
  schoolComments: SchoolComment[];

  @OneToMany(() => PostSave, (save) => save.user)
  postSaves: PostSave[];
}
