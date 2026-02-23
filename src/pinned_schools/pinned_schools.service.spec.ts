import { Test, TestingModule } from '@nestjs/testing';
import { PinnedSchoolsService } from './pinned_schools.service';

describe('PinnedSchoolsService', () => {
  let service: PinnedSchoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PinnedSchoolsService],
    }).compile();

    service = module.get<PinnedSchoolsService>(PinnedSchoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
