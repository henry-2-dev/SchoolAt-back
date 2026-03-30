import { Module } from '@nestjs/common';
import { SchoolsPhotosController } from './schools_photos.controller';
import { SchoolsPhotosService } from './schools_photos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsPhotos } from './schools-photos.entity';
import { School } from '../schools/schools.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolsPhotos, School])],
  controllers: [SchoolsPhotosController],
  providers: [SchoolsPhotosService],
})
export class SchoolsPhotosModule {}
