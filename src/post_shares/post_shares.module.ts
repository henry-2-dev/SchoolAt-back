import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostShare } from './post-shares.entity';
import { PostSharesController } from './post_shares.controller';
import { PostSharesService } from './post_shares.service';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostShare]), UsersModule],
  controllers: [PostSharesController],
  providers: [PostSharesService],
})
export class PostSharesModule {}
