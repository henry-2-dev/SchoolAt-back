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
        ppschool: post.school?.profilePhoto,
        nameschool: post.school?.name,
        levelschool: post.school?.type,
        cituschool: post.school?.city,
        timeposted: post.createdAt,
        descriptionpost: post.description,
        message: post.content,
        type: post.type,
        containpost: post.media
          ? post.media.map((m) => ({
              id: m.id,
              url: m.mediaUrl,
              type: m.type,
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
        isSavedByUser: true,
        commentpost: post.comments
          ? post.comments.map((comment) => ({
              id: comment.id,
              message: comment.content,
              ppuser: comment.user?.profilePhoto,
              nameuser: comment.user?.fullName,
              datetimecomment: comment.createdAt,
            }))
          : [],
      };
    });
  }
}
