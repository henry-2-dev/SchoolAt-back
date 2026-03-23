import { Body, Controller, Post } from '@nestjs/common';
import { PostReportsService } from './post_reports.service';
import { CreatePostReportDto } from './create-post-report.dto';
import { PostReport } from './post-reports.entity';

@Controller('post-reports')
export class PostReportsController {
  constructor(private readonly postReportsService: PostReportsService) {}

  @Post()
  async create(@Body() createPostReportDto: CreatePostReportDto): Promise<PostReport> {
    return await this.postReportsService.create(createPostReportDto);
  }
}
