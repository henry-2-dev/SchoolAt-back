import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolPost } from './schools-posts.entity';
import { SchoolsPostsController } from './schools_posts.controller';
import { SchoolsPostsService } from './schools_posts.service';

import { SchoolsModule } from '../schools/schools.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserPinnedSchool } from '../pinned_schools/pinned-schools.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolPost, UserPinnedSchool]), SchoolsModule, NotificationsModule],
  controllers: [SchoolsPostsController],
  providers: [SchoolsPostsService],
})
export class SchoolsPostsModule {}
