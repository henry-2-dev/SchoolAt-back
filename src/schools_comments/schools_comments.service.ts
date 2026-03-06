import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolsService } from '../schools/schools.service';
import { UsersService } from '../users/users.service';
import { CreateSchoolCommentDto } from './dto/create-school-comment.dto';
import { UpdateSchoolCommentDto } from './dto/update-school-comment.dto';
import { SchoolComment } from './schools-comments.entity';

@Injectable()
export class SchoolsCommentsService {
  constructor(
    @InjectRepository(SchoolComment)
    private readonly commentRepository: Repository<SchoolComment>,
    private readonly usersService: UsersService,
    private readonly schoolsService: SchoolsService,
  ) {}

  /** Créer un avis sur une école */
  async create(dto: CreateSchoolCommentDto) {
    const user = await this.usersService.findByIdOrClerkId(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    const school = await this.schoolsService.findByIdOrClerkId(dto.schoolId);
    if (!school) throw new NotFoundException('School not found');

    const comment = this.commentRepository.create({
      content: dto.content,
      rating: dto.rating,
      user: user,
      school: school,
    } as any);
    return this.commentRepository.save(comment);
  }

  /** Récupérer tous les avis */
  findAll() {
    return this.commentRepository.find({
      relations: ['user', 'school'],
    });
  }

  /** Récupérer tous les avis d'une école, avec la note moyenne */
  async findBySchool(schoolId: string) {
    const school = await this.schoolsService.findByIdOrClerkId(schoolId);
    if (!school) throw new NotFoundException('School not found');

    const comments = await this.commentRepository.find({
      where: { school: { id: school.id } },
      relations: ['user', 'school'],
    });

    const averageRating =
      comments.length > 0
        ? comments.reduce((sum, c) => sum + c.rating, 0) / comments.length
        : null;

    return {
      averageRating: averageRating
        ? parseFloat(averageRating.toFixed(2))
        : null,
      totalComments: comments.length,
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        rating: c.rating,
        createdAt: c.createdAt,
        user: {
          id: c.user?.id,
          fullName: c.user?.fullName,
          profilePhoto: c.user?.profilePhoto,
        },
      })),
    };
  }

  /** Récupérer un avis par son id */
  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'school'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  /** Mettre à jour un avis (content et/ou rating) */
  async update(id: string, dto: UpdateSchoolCommentDto) {
    await this.commentRepository.update(id, dto as any);
    return this.findOne(id);
  }

  /** Supprimer un avis */
  remove(id: string) {
    return this.commentRepository.delete(id);
  }
}
