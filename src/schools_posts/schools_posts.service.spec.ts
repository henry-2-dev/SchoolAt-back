import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsPostsService } from './schools_posts.service';

describe('SchoolsPostsService', () => {
  let service: SchoolsPostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolsPostsService],
    }).compile();

    service = module.get<SchoolsPostsService>(SchoolsPostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
