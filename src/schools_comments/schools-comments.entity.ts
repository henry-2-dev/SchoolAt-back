import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { School } from '../schools/schools.entity';

@Entity('school_comments')
export class SchoolComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ type: 'int' })
  rating: number;

  @ManyToOne(() => User, (user) => user.schoolComments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => School, (school) => school.comments, { onDelete: 'CASCADE' })
  school: School;

  @CreateDateColumn()
  createdAt: Date;
}
