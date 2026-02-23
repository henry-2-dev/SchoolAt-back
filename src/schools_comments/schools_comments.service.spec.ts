import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsCommentsService } from './schools_comments.service';

describe('SchoolsCommentsService', () => {
  let service: SchoolsCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolsCommentsService],
    }).compile();

    service = module.get<SchoolsCommentsService>(SchoolsCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
