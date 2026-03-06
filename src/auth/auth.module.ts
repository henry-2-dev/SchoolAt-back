import { Module } from '@nestjs/common';
import { SchoolsModule } from '../schools/schools.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule, SchoolsModule],
  controllers: [AuthController],
})
export class AuthModule {}
