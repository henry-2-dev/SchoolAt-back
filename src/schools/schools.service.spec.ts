import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolsService } from './schools.service';
import { School } from './schools.entity';

describe('SchoolsService', () => {
  let service: SchoolsService;
  let repository: Repository<School>;

  const mockSchool = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    clerkId: 'user_123',
    name: 'Ecole Exemplaire',
    views: 10,
    posts: [],
    photos: [],
    comments: [],
    pinnedBy: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolsService,
        {
          provide: getRepositoryToken(School),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockSchool),
            increment: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<SchoolsService>(SchoolsService);
    repository = module.get<Repository<School>>(getRepositoryToken(School));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findProfileSchoolById', () => {
    it('should return a profile school if found by UUID', async () => {
      const result = await service.findProfileSchoolById(mockSchool.id);
      expect(result).toBeDefined();
      expect(result?.nameschool).toBe(mockSchool.name);
      expect(repository.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockSchool.id }
      }));
    });

    it('should return a profile school if found by clerkId', async () => {
      const result = await service.findProfileSchoolById('user_123');
      expect(result).toBeDefined();
      expect(result?.clerkid).toBe('user_123');
    });

    it('should return null if school is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      const result = await service.findProfileSchoolById('non_existent');
      expect(result).toBeNull();
    });

    it('should increment views if userId is provided and different from school clerkId', async () => {
      await service.findProfileSchoolById(mockSchool.id, 'other_user');
      expect(repository.increment).toHaveBeenCalledWith({ id: mockSchool.id }, 'views', 1);
    });
  });
});
