import { Test, TestingModule } from '@nestjs/testing';
import { PostSharesController } from './post_shares.controller';

describe('PostSharesController', () => {
  let controller: PostSharesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostSharesController],
    }).compile();

    controller = module.get<PostSharesController>(PostSharesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
