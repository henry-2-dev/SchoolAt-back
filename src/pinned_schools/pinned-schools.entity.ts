import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { School } from '../schools/schools.entity';

@Entity('user_pinned_schools')
export class UserPinnedSchool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.pinnedSchools, { onDelete: 'CASCADE', nullable: true })
  user: User;

  @ManyToOne(() => School, { onDelete: 'CASCADE', nullable: true })
  pinnerSchool: School;

  @ManyToOne(() => School, (school) => school.pinnedBy, { onDelete: 'CASCADE' })
  school: School;

  @CreateDateColumn()
  createdAt: Date;
}
