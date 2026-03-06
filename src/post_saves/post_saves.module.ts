import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostSave } from './post-saves.entity';
import { PostSavesController } from './post_saves.controller';
import { PostSavesService } from './post_saves.service';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostSave]), UsersModule],
  providers: [PostSavesService],
  controllers: [PostSavesController],
  exports: [PostSavesService],
})
export class PostSavesModule {}
