import { Module } from '@nestjs/common';
import { PostCommentsController } from './post_comments.controller';
import { PostCommentsService } from './post_comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './post-comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment])],
  controllers: [PostCommentsController],
  providers: [PostCommentsService],
})
export class PostCommentsModule {}
