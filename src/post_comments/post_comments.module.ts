import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './post-comments.entity';
import { PostCommentsController } from './post_comments.controller';
import { PostCommentsService } from './post_comments.service';

import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SchoolPost } from '../schools_posts/schools-posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment, SchoolPost]), UsersModule, NotificationsModule],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
