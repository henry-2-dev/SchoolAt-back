import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsCommentsController } from './schools_comments.controller';

describe('SchoolsCommentsController', () => {
  let controller: SchoolsCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsCommentsController],
    }).compile();

    controller = module.get<SchoolsCommentsController>(
      SchoolsCommentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
