import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsPhotosController } from './schools_photos.controller';

describe('SchoolsPhotosController', () => {
  let controller: SchoolsPhotosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolsPhotosController],
    }).compile();

    controller = module.get<SchoolsPhotosController>(SchoolsPhotosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
