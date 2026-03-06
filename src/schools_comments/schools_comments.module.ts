import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolComment } from './schools-comments.entity';
import { SchoolsCommentsController } from './schools_comments.controller';
import { SchoolsCommentsService } from './schools_comments.service';

import { SchoolsModule } from '../schools/schools.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchoolComment]),
    UsersModule,
    SchoolsModule,
  ],
  controllers: [SchoolsCommentsController],
  providers: [SchoolsCommentsService],
})
export class SchoolsCommentsModule {}
