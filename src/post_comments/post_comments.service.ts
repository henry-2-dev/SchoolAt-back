import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { PostComment } from './post-comments.entity';
import { SchoolPost } from '../schools_posts/schools-posts.entity';

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(PostComment)
    private readonly commentRepository: Repository<PostComment>,
    @InjectRepository(SchoolPost)
    private readonly postRepository: Repository<SchoolPost>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreatePostCommentDto) {
    const user = await this.usersService.findByIdOrClerkId(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    const comment = this.commentRepository.create({
      content: dto.content,
      user: user,
      post: { id: dto.postId } as any,
    });
    
    const savedComment = await this.commentRepository.save(comment);

    // Get the post to know which school to notify
    try {
      const post = await this.postRepository.findOne({ where: { id: dto.postId } });
      if (post && post.schoolId) {
        await this.notificationsService.notifyUser(
          post.schoolId,
          '💬 Nouveau commentaire',
          `${user.fullName || 'Quelqu\'un'} a commenté votre publication.`,
          { type: 'comment', postId: post.id, userId: user.id }
        );
      }
    } catch (e) {
      console.warn('[Notifications] Could not notify school on comment:', e?.message);
    }

    return savedComment;
  }

  findAll() {
    return this.commentRepository.find({
      relations: ['post', 'user'],
    });
  }

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post', 'user'],
    });

    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: string, dto: UpdatePostCommentDto) {
    await this.commentRepository.update(id, dto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.commentRepository.delete(id);
  }
}
