import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PinnedSchoolsService } from './pinned_schools.service';
import { PinnedSchoolsController } from './pinned_schools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPinnedSchool } from './pinned-schools.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPinnedSchool, User])],
  controllers: [PinnedSchoolsController],
  providers: [PinnedSchoolsService],
})
export class PinnedSchoolsModule {}
