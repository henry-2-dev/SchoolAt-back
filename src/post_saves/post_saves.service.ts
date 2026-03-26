import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { PostSave } from './post-saves.entity';

@Injectable()
export class PostSavesService {
  constructor(
    @InjectRepository(PostSave)
    private readonly saveRepository: Repository<PostSave>,
    private readonly usersService: UsersService,
  ) {}

  async toggleSave(userId: string, postId: string) {
    const user = await this.usersService.findByIdOrClerkId(userId);
    if (!user) throw new NotFoundException('User not found');

    const existingSave = await this.saveRepository.findOne({
      where: {
        user: { id: user.id },
        post: { id: postId },
      },
    });

    if (existingSave) {
      await this.saveRepository.remove(existingSave);
      return { saved: false };
    } else {
      const newSave = this.saveRepository.create({
        user: user,
        post: { id: postId } as any,
      });
      await this.saveRepository.save(newSave);
      return { saved: true };
    }
  }

  async isSaved(userId: string, postId: string) {
    const user = await this.usersService.findByIdOrClerkId(userId);
    if (!user) return false;

    const count = await this.saveRepository.count({
      where: {
        user: { id: user.id },
        post: { id: postId },
      },
    });
    return count > 0;
  }

  async getUserSaves(userId: string) {
    const user = await this.usersService.findByIdOrClerkId(userId);
    if (!user) throw new NotFoundException('User not found');

    const saves = await this.saveRepository.find({
      where: { user: { id: user.id } },
      relations: [
        'post',
        'post.school',
        'post.media',
        'post.comments',
        'post.comments.user',
        'post.shares',
        'post.saves',
        'post.saves.user',
      ],
    });

    return saves.map((save) => {
      const post = save.post;
      // ... mapping logic remains the same ...
      return {
        idPost: post.id,
        idSchool: post.school?.id ?? (post as any).schoolId ?? null,
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
        nbviewpost:
          (post.views ?? 0) +
          (post.comments?.length || 0) +
          (post.saves?.length || 0) +
          (post.shares?.length || 0),
        nbcommentpost: post.comments?.length || 0,
        nbsavepost: post.saves?.length || 0,
        nbsharepost: post.shares?.length || 0,
        isSavedByUser: true,
        commentpost: (post.comments || []).map((comment: any) => ({
          id: comment.id || Math.random().toString(),
          message: comment.content || comment.message || comment.text || "Message vide",
          ppuser: comment.user?.profilePhoto || null,
          nameuser: comment.user?.fullName || comment.user?.name || "Utilisateur",
          datetimecomment: comment.createdAt || comment.date || new Date().toISOString(),
        })),
      };
    });
  }
}
