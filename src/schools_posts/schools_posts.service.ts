import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POSTDTO } from '../feeddto';
import { SchoolsService } from '../schools/schools.service';
import { CreateSchoolPostDto } from './dto/create-school-post.dto';
import { UpdateSchoolPostDto } from './dto/update-school-post.dto';
import { SchoolPost } from './schools-posts.entity';

@Injectable()
export class SchoolsPostsService {
  constructor(
    @InjectRepository(SchoolPost)
    private readonly postRepository: Repository<SchoolPost>,
    private readonly schoolsService: SchoolsService,
  ) {}

  async findAllFormatted(userId?: string): Promise<POSTDTO[]> {
    try {
      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.school', 'school')
        .leftJoinAndSelect('post.media', 'media')
        .leftJoinAndSelect('post.comments', 'comments')
        .leftJoinAndSelect('comments.user', 'user')
        .leftJoinAndSelect('post.shares', 'shares')
        .leftJoinAndSelect('post.saves', 'saves')
        .leftJoinAndSelect('saves.user', 'save_user')
        .orderBy('post.createdAt', 'DESC')
        .addOrderBy('comments.createdAt', 'ASC')
        .getMany();

      return posts.map((post) => ({
        idPost: post.id,
        idSchool: post.school?.id ?? post.schoolId ?? null,
        ppschool: post.school?.profilePhoto ?? null,
        nameschool: post.school?.name ?? null,
        levelschool: post.school?.type ?? null,
        cituschool: post.school?.city ?? null,
        timeposted: post.createdAt,
        descriptionpost: post.description ?? null,
        message: post.content ?? null,
        type: post.type,
        containpost: post.media
          ? post.media.map((m) => ({
              id: m.id,
              url: m.mediaUrl ?? null,
              type: m.type ?? null,
            }))
          : [],

        nbviewpost:
          (post.views ?? 0) +
          (post.comments ? post.comments.length : 0) +
          (post.saves ? post.saves.length : 0) +
          (post.shares ? post.shares.length : 0),
        nbcommentpost: post.comments ? post.comments.length : 0,
        nbsavepost: post.saves ? post.saves.length : 0,
        nbsharepost: post.shares ? post.shares.length : 0,

        isSavedByUser: post.saves
          ? post.saves.some((save) => save.user?.id === targetUserId)
          : false,

        commentpost: post.comments
          ? post.comments.map((comment) => ({
              id: comment.id,
              message: comment.content ?? (comment as any).text ?? null,
              ppuser: comment.user?.profilePhoto ?? null,
              nameuser: comment.user?.fullName ?? (comment.user as any)?.name ?? "Utilisateur",
              datetimecomment: comment.createdAt || (comment as any).date,
            }))
          : [],
      }));
    } catch (e) {
      console.error('Erreur dans findAllFormatted:', e);
      throw e;
    }
  }

  async create(dto: CreateSchoolPostDto) {
    // Résoudre l'école par ID ou Clerk ID
    const school = await this.schoolsService.findByIdOrClerkId(dto.schoolId);

    if (!school) {
      throw new NotFoundException(`School with ID ${dto.schoolId} not found`);
    }

    const post = this.postRepository.create({
      type: dto.type,
      content: dto.content,
      description: dto.description,
      school: school,
      media: dto.media ? dto.media : [],
    } as any);
    return this.postRepository.save(post);
  }

  findAll() {
    return this.postRepository.find({
      relations: ['school', 'media', 'comments', 'shares'],
    });
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['school', 'media', 'comments', 'shares'],
    });

    return post;
  }

  async update(id: string, dto: UpdateSchoolPostDto) {
    await this.postRepository.update(id, dto as any);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.postRepository.delete(id);
  }
}
