import { Module } from '@nestjs/common';
import { SchoolsCommentsController } from './schools_comments.controller';
import { SchoolsCommentsService } from './schools_comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolComment } from './schools-comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolComment])],
  controllers: [SchoolsCommentsController],
  providers: [SchoolsCommentsService],
})
export class SchoolsCommentsModule {}
