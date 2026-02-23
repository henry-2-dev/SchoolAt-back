import { Module } from '@nestjs/common';
import { SchoolsPostsController } from './schools_posts.controller';
import { SchoolsPostsService } from './schools_posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolPost } from './schools-posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolPost])],
  controllers: [SchoolsPostsController],
  providers: [SchoolsPostsService],
})
export class SchoolsPostsModule {}
