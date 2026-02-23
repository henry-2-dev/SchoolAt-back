import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { School } from '../schools/schools.entity';

@Entity('schools_photos')
export class SchoolsPhotos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => School, (school) => school.photos, { onDelete: 'CASCADE' })
  school: School;
}
