import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReport } from './post-reports.entity';
import { CreatePostReportDto } from './create-post-report.dto';
import { SchoolPost } from '../schools_posts/schools-posts.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostReportsService {
  constructor(
    @InjectRepository(PostReport)
    private readonly postReportsRepository: Repository<PostReport>,
    @InjectRepository(SchoolPost)
    private readonly schoolPostsRepository: Repository<SchoolPost>,
    private readonly usersService: UsersService,
  ) {}

  async create(createPostReportDto: CreatePostReportDto): Promise<PostReport> {
    const { postId, userId, reason, details } = createPostReportDto;

    const post = await this.schoolPostsRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.usersService.findByIdOrClerkId(userId);
    if (!user) throw new NotFoundException('User not found');

    const report = this.postReportsRepository.create({
      reason,
      details,
      post,
      user,
    });

    return await this.postReportsRepository.save(report);
  }
}
