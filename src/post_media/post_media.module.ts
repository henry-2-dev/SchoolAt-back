import { Module } from '@nestjs/common';
import { PostMediaController } from './post_media.controller';
import { PostMediaService } from './post_media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostMedia } from './post-media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostMedia])],
  controllers: [PostMediaController],
  providers: [PostMediaService],
})
export class PostMediaModule {}
