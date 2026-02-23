import { Test, TestingModule } from '@nestjs/testing';
import { PostMediaController } from './post_media.controller';

describe('PostMediaController', () => {
  let controller: PostMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostMediaController],
    }).compile();

    controller = module.get<PostMediaController>(PostMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
