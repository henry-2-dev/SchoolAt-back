import { Module } from '@nestjs/common';
import { PostSharesController } from './post_shares.controller';
import { PostSharesService } from './post_shares.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostShare } from './post-shares.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostShare])],
  controllers: [PostSharesController],
  providers: [PostSharesService],
})
export class PostSharesModule {}
