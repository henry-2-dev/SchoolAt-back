import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReport } from './post-reports.entity';
import { PostReportsController } from './post_reports.controller';
import { PostReportsService } from './post_reports.service';
import { SchoolPost } from '../schools_posts/schools-posts.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostReport, SchoolPost, User]), UsersModule],
  controllers: [PostReportsController],
  providers: [PostReportsService],
})
export class PostReportsModule {}
