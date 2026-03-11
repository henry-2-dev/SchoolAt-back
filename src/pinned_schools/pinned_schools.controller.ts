import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PinnedSchoolsService } from './pinned_schools.service';

@Controller('pinned-schools')
export class PinnedSchoolsController {
  constructor(private readonly pinnedService: PinnedSchoolsService) {}

  @Post('toggle')
  togglePin(@Body() body: { userId: string; schoolId: string }) {
    return this.pinnedService.togglePin(body.userId, body.schoolId);
  }

  @Get('user/:userId')
  findUserPinned(@Param('userId') userId: string) {
    return this.pinnedService.getUserPinnedSchools(userId);
  }
}
