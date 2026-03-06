import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './post-comments.entity';
import { PostCommentsController } from './post_comments.controller';
import { PostCommentsService } from './post_comments.service';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment]), UsersModule],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
