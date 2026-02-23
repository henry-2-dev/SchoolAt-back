import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsPostsController } from './schools_posts.controller';

describe('SchoolsPostsController', () => {
  let controller: SchoolsPostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsPostsController],
    }).compile();

    controller = module.get<SchoolsPostsController>(SchoolsPostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
