import { Test, TestingModule } from '@nestjs/testing';
import { PinnedSchoolsController } from './pinned_schools.controller';

describe('PinnedSchoolsController', () => {
  let controller: PinnedSchoolsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinnedSchoolsController],
    }).compile();

    controller = module.get<PinnedSchoolsController>(PinnedSchoolsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
