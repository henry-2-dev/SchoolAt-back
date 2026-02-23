import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SchoolsCommentsService } from './schools_comments.service';
import { CreateSchoolCommentDto } from './dto/create-school-comment.dto';
import { UpdateSchoolCommentDto } from './dto/update-school-comment.dto';

@Controller('schools-comments')
export class SchoolsCommentsController {
  constructor(private readonly commentsService: SchoolsCommentsService) {}

  /** POST /schools-comments — Créer un avis sur une école */
  @Post()
  create(@Body() dto: CreateSchoolCommentDto) {
    return this.commentsService.create(dto);
  }

  /** GET /schools-comments — Récupérer tous les avis */
  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  /** GET /schools-comments/school/:schoolId — Avis d'une école + note moyenne */
  @Get('school/:schoolId')
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.commentsService.findBySchool(schoolId);
  }

  /** GET /schools-comments/:id — Récupérer un avis */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  /** PATCH /schools-comments/:id — Modifier un avis */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolCommentDto) {
    return this.commentsService.update(id, dto);
  }

  /** DELETE /schools-comments/:id — Supprimer un avis */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
