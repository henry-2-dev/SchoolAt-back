import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { School } from '../schools/schools.entity';

@Entity('user_pinned_schools')
@Unique(['user', 'school'])
export class UserPinnedSchool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.pinnedSchools, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => School, (school) => school.pinnedBy, { onDelete: 'CASCADE' })
  school: School;

  @CreateDateColumn()
  createdAt: Date;
}
