import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchoolsPhotosService } from './schools_photos.service';
import { CreateSchoolPhotoDto } from './dto/create-school-photo.dto';
import { UpdateSchoolPhotoDto } from './dto/update-school-photo.dto';

@Controller('schools-photos')
export class SchoolsPhotosController {
  constructor(private readonly photosService: SchoolsPhotosService) {}

  /** POST /schools-photos — Ajouter une photo à une école */
  @Post()
  create(@Body() dto: CreateSchoolPhotoDto) {
    return this.photosService.create(dto);
  }

  /** GET /schools-photos — Récupérer toutes les photos */
  @Get()
  findAll() {
    return this.photosService.findAll();
  }

  /** GET /schools-photos/school/:schoolId — Photos d'une école */
  @Get('school/:schoolId')
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.photosService.findBySchool(schoolId);
  }

  /** GET /schools-photos/:id — Récupérer une photo */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  /** PATCH /schools-photos/:id — Mettre à jour une photo */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolPhotoDto) {
    return this.photosService.update(id, dto);
  }

  /** DELETE /schools-photos/:id — Supprimer une photo */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}
