import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { UpdatePostCommentDto } from './dto/update-post-comment.dto';
import { PostComment } from './post-comments.entity';

@Injectable()
export class PostCommentsService {
  constructor(
    @InjectRepository(PostComment)
    private readonly commentRepository: Repository<PostComment>,
  ) {}

  create(dto: CreatePostCommentDto) {
    const comment = this.commentRepository.create({
      content: dto.content,
      userId: dto.userId,
      postId: dto.postId,
    });
    return this.commentRepository.save(comment);
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
