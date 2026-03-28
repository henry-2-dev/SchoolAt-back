import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { POSTDTO } from '../feeddto';
import { SchoolsService } from '../schools/schools.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserPinnedSchool } from '../pinned_schools/pinned-schools.entity';
import { CreateSchoolPostDto } from './dto/create-school-post.dto';
import { UpdateSchoolPostDto } from './dto/update-school-post.dto';
import { SchoolPost } from './schools-posts.entity';

@Injectable()
export class SchoolsPostsService {
  constructor(
    @InjectRepository(SchoolPost)
    private readonly postRepository: Repository<SchoolPost>,
    @InjectRepository(UserPinnedSchool)
    private readonly pinnedRepository: Repository<UserPinnedSchool>,
    private readonly schoolsService: SchoolsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAllFormatted(userId?: string): Promise<POSTDTO[]> {
    try {
      const posts = await this.postRepository.find({
        relations: ['school', 'media', 'comments', 'comments.user', 'saves', 'saves.user', 'shares'],
        order: { createdAt: 'DESC' },
      });

      const targetUserId = userId || '00000000-0000-4000-8000-000000000001';
      return posts.map((post) => this._formatPost(post, targetUserId));
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
    } as any) as SchoolPost;
    
    const savedPost = await this.postRepository.save(post);

    // Notify all followers (users who pinned this school)
    try {
      const followers = await this.pinnedRepository.find({
        where: { school: { id: school.id } },
        relations: ['user'],
      });

      const userIds = followers.map((f) => f.user.id);
      
      // Send notifications in parallel (NotificationsService will handle each asynchronously)
      userIds.forEach((userId) => {
        this.notificationsService.notifyUser(
          userId,
          `Nouvelle publication de ${school.name}`,
          'Découvrez les dernières actualités !',
          { type: 'post', postId: savedPost.id, schoolId: school.id }
        ).catch(err => {
          console.warn(`[Notifications] Failed to notify user ${userId}:`, err?.message);
        });
      });
    } catch (e) {
      console.warn('[Notifications] Could not notify followers on new post:', e?.message);
    }

    return savedPost;
  }


  findAll() {
    return this.postRepository.find({
      relations: ['school', 'media', 'comments', 'shares'],
    });
  }

  private _formatPost(post: any, targetUserId: string): POSTDTO {
    return {
      idPost: post.id,
      idSchool: post.school?.id ?? post.schoolId ?? null,
      ppschool: post.school?.profilePhoto ?? null,
      nameschool: post.school?.name || "École",
      levelschool: post.school?.type || "Scolaire",
      cituschool: post.school?.city || "Cameroun",
      timeposted: post.createdAt,
      descriptionpost: post.description ?? null,
      message: post.content ?? null,
      type: post.type,
      containpost: (post.media || []).map((m: any) => ({
        id: m.id,
        url: m.mediaUrl ?? null,
        type: m.type ?? null,
      })),
      nbviewpost: (post.views ?? 0) + (post.comments?.length || 0) + (post.saves?.length || 0) + (post.shares?.length || 0),
      nbcommentpost: post.comments?.length || 0,
      nbsavepost: post.saves?.length || 0,
      nbsharepost: post.shares?.length || 0,
      isSavedByUser: (post.saves || []).some((save: any) => save.user?.id === targetUserId),
      commentpost: (post.comments || []).map((comment: any) => ({
        id: comment.id || Math.random().toString(),
        message: comment.content || comment.message || comment.text || "Message vide",
        ppuser: comment.user?.profilePhoto || null,
        nameuser: comment.user?.fullName || comment.user?.name || "Utilisateur",
        datetimecomment: comment.createdAt || comment.date || new Date().toISOString(),
      })),
    };
  }

  async findOne(id: string, userId?: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['school', 'media', 'comments', 'comments.user', 'saves', 'saves.user', 'shares'],
    });

    if (!post) throw new NotFoundException('Post not found');
    const targetUserId = userId || '00000000-0000-4000-8000-000000000001';
    return this._formatPost(post, targetUserId);
  }

  async update(id: string, dto: UpdateSchoolPostDto) {
    await this.postRepository.update(id, dto as any);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.postRepository.delete(id);
  }
}
