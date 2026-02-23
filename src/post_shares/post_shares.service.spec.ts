import { Test, TestingModule } from '@nestjs/testing';
import { PostSharesService } from './post_shares.service';

describe('PostSharesService', () => {
  let service: PostSharesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostSharesService],
    }).compile();

    service = module.get<PostSharesService>(PostSharesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
