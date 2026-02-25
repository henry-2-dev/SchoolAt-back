import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolsPhotos } from './schools-photos.entity';
import { CreateSchoolPhotoDto } from './dto/create-school-photo.dto';
import { UpdateSchoolPhotoDto } from './dto/update-school-photo.dto';

@Injectable()
export class SchoolsPhotosService {
  constructor(
    @InjectRepository(SchoolsPhotos)
    private readonly photoRepository: Repository<SchoolsPhotos>,
  ) {}

  /** Ajouter une photo à une école */
  create(dto: CreateSchoolPhotoDto) {
    const photo = this.photoRepository.create({
      photoUrl: dto.photoUrl,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      school: { id: dto.schoolId } as any,
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
