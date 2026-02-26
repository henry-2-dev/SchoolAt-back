import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POSTDTO } from '../feeddto';
import { CreateSchoolPostDto } from './dto/create-school-post.dto';
import { UpdateSchoolPostDto } from './dto/update-school-post.dto';
import { SchoolPost } from './schools-posts.entity';

@Injectable()
export class SchoolsPostsService {
  constructor(
    @InjectRepository(SchoolPost)
    private readonly postRepository: Repository<SchoolPost>,
  ) {}

  async findAllFormatted(): Promise<POSTDTO[]> {
    try {
      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.school', 'school')
        .leftJoinAndSelect('post.media', 'media')
        .leftJoinAndSelect('post.comments', 'comments')
        .leftJoinAndSelect('comments.user', 'user')
        .leftJoinAndSelect('post.shares', 'shares')
        .orderBy('post.createdAt', 'DESC')
        .addOrderBy('comments.createdAt', 'ASC')
        .getMany();

      return posts.map((post) => ({
        idPost: post.id,
        ppschool: post.school?.profilePhoto ?? null,
        nameschool: post.school?.name ?? null,
        levelschool: post.school?.type ?? null,
        cituschool: post.school?.city ?? null,
        timeposted: post.createdAt,
        descriptionpost: post.description ?? null,
        message: post.content ?? null,
        type: post.type,
        containpost: post.media
          ? post.media.map((media) => ({
              id: media.id,
              url: media.mediaUrl ?? null,
              type: media.type ?? null,
            }))
          : [],

        nbviewpost:
          (post.views ?? 0) +
          (post.comments ? post.comments.length : 0) +
          (post.saves ?? 0) +
          (post.shares ? post.shares.length : 0),
        nbcommentpost: post.comments ? post.comments.length : 0,
        nbsavepost: post.saves ?? 0,
        nbsharepost: post.shares ? post.shares.length : 0,

        commentpost: post.comments
          ? post.comments.map((comment) => ({
              id: comment.id,
              message: comment.content ?? null,
              ppuser: comment.user?.profilePhoto ?? null,
              nameuser: comment.user?.fullName ?? null,
              datetimecomment: comment.createdAt,
            }))
          : [],
      }));
    } catch (e) {
      console.error('Erreur dans findAllFormatted:', e);
      throw e;
    }
  }

  create(dto: CreateSchoolPostDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const post = this.postRepository.create({
      type: dto.type,
      content: dto.content,
      description: dto.description,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      school: { id: dto.schoolId } as any,
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
