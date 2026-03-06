import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolPost } from './schools-posts.entity';
import { SchoolsPostsController } from './schools_posts.controller';
import { SchoolsPostsService } from './schools_posts.service';

import { SchoolsModule } from '../schools/schools.module';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolPost]), SchoolsModule],
  controllers: [SchoolsPostsController],
  providers: [SchoolsPostsService],
})
export class SchoolsPostsModule {}
