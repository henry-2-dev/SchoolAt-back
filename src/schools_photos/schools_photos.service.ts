import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolsPhotos } from './schools-photos.entity';
import { School } from '../schools/schools.entity';
import { CreateSchoolPhotoDto } from './dto/create-school-photo.dto';
import { UpdateSchoolPhotoDto } from './dto/update-school-photo.dto';

@Injectable()
export class SchoolsPhotosService {
  constructor(
    @InjectRepository(SchoolsPhotos)
    private readonly photoRepository: Repository<SchoolsPhotos>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  /** Ajouter une photo à une école */
  async create(dto: CreateSchoolPhotoDto) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        dto.schoolId,
      );

    const school = await this.schoolRepository.findOne({
      where: isUuid ? { id: dto.schoolId } : { clerkId: dto.schoolId },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${dto.schoolId} not found`);
    }

    const photo = this.photoRepository.create({
      photoUrl: dto.photoUrl,
      school: school,
    });
    return this.photoRepository.save(photo);
  }

  /** Récupérer toutes les photos */
  findAll() {
    return this.photoRepository.find({
      relations: ['school'],
    });
  }

  /** Récupérer toutes les photos d'une école spécifique */
  findBySchool(schoolId: string) {
    return this.photoRepository.find({
      where: { school: { id: schoolId } },
      relations: ['school'],
    });
  }

  /** Récupérer une photo par son id */
  async findOne(id: string) {
    const photo = await this.photoRepository.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }

  /** Mettre à jour l'URL d'une photo */
  async update(id: string, dto: UpdateSchoolPhotoDto) {
    await this.photoRepository.update(id, dto as any);
    return this.findOne(id);
  }

  /** Supprimer une photo */
  remove(id: string) {
    return this.photoRepository.delete(id);
  }
}
