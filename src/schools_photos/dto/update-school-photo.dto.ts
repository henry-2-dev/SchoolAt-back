import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolPhotoDto } from './create-school-photo.dto';

export class UpdateSchoolPhotoDto extends PartialType(CreateSchoolPhotoDto) {}
