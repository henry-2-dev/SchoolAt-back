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

  // Fonction utilitaire pour mélanger un tableau (Fisher-Yates)
  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async findAllFormatted(userId?: string, limit: number = 100): Promise<POSTDTO[]> {
    try {
      const targetUserId = userId || '00000000-0000-4000-8000-000000000001';

      // 1. Récupérer les écoles épinglées par l'utilisateur (ou l'école)
      const user = await this.schoolsService.findByIdOrClerkId(targetUserId); // Optionnel, vu qu'on l'a peut-être pas
      let pinnedSchoolIds: string[] = [];
      try {
        const pinnedSchools = await this.pinnedRepository.find({
          where: [
            { user: { clerkId: targetUserId } },
            { user: { id: targetUserId } },
            { pinnerSchool: { clerkId: targetUserId } },
            { pinnerSchool: { id: targetUserId } }
          ],
          relations: ['school'],
        });
        pinnedSchoolIds = pinnedSchools.map(p => p.school.id);
      } catch (e) {
        console.warn('Erreur récupération épingles:', e.message);
      }

      // 2. Récupérer un grand lot de posts récents
      const allPosts = await this.postRepository.find({
        relations: ['school', 'media', 'comments', 'comments.user', 'saves', 'saves.user', 'shares'],
        order: { createdAt: 'DESC' },
        take: 300,
      });

      // 3. Séparer les posts en 3 catégories
      let pinnedPosts: any[] = [];
      let newPosts: any[] = [];
      let otherPosts: any[] = [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      allPosts.forEach(post => {
        if (pinnedSchoolIds.includes(post.school.id)) {
          pinnedPosts.push(post);
        } else if (new Date(post.createdAt) >= sevenDaysAgo) {
          newPosts.push(post);
        } else {
          otherPosts.push(post);
        }
      });

      // 4. Mélanger chaque catégorie pour la variance
      pinnedPosts = this.shuffleArray(pinnedPosts);
      newPosts = this.shuffleArray(newPosts);
      otherPosts = this.shuffleArray(otherPosts);

      // 5. Construire le flux final (Target: limit)
      // Ex: limit = 100 -> ~20 épinglés, ~40 nouveaux, ~40 autres
      const targetPinned = Math.floor(limit * 0.2);
      const targetNew = Math.floor(limit * 0.4);
      
      let initialBlend = [
        ...pinnedPosts.slice(0, targetPinned),
        ...newPosts.slice(0, targetNew),
        ...otherPosts.slice(0, limit - targetPinned - targetNew),
      ];

      // Si on n'a pas atteint la limite (par ex: pas assez de pinned posts), on complète avec les restes
      const remainingLimit = limit - initialBlend.length;
      if (remainingLimit > 0) {
        const leftovers = [
          ...pinnedPosts.slice(targetPinned),
          ...newPosts.slice(targetNew),
          ...otherPosts.slice(limit - targetPinned - targetNew)
        ];
        initialBlend = [...initialBlend, ...leftovers.slice(0, remainingLimit)];
      }

      // 6. Mélanger le flux final pour un effet "réseau social", 
      // mais on pourrait garder les épinglés en haut.
      // Mélangeons tout pour un vrai effet aléatoire (ou seulement les nouveautés/autres)
      const finalFeed = this.shuffleArray(initialBlend);

      return finalFeed.map((post) => this._formatPost(post, targetUserId));
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

    const postData: any = {
      type: dto.type,
      content: dto.content,
      description: dto.description,
      school: school,
      media: dto.media ? dto.media : [],
    };
    
    const post = this.postRepository.create(postData);
    const savedPost: any = await this.postRepository.save(post);

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
      isVerified: post.school?.isVerified ?? false,
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
