import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { SchoolsModule } from '../schools/schools.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserPinnedSchool } from './pinned-schools.entity';
import { PinnedSchoolsController } from './pinned_schools.controller';
import { PinnedSchoolsService } from './pinned_schools.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserPinnedSchool]), UsersModule, SchoolsModule, NotificationsModule],
  controllers: [PinnedSchoolsController],
  providers: [PinnedSchoolsService],
})
export class PinnedSchoolsModule {}
