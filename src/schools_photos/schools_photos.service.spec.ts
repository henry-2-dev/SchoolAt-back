import { Test, TestingModule } from '@nestjs/testing';
import { SchoolsPhotosService } from './schools_photos.service';

describe('SchoolsPhotosService', () => {
  let service: SchoolsPhotosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolsPhotosService],
    }).compile();

    service = module.get<SchoolsPhotosService>(SchoolsPhotosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
