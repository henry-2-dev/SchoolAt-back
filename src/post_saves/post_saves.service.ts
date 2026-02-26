import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostSave } from './post-saves.entity';

@Injectable()
export class PostSavesService {
  constructor(
    @InjectRepository(PostSave)
    private readonly saveRepository: Repository<PostSave>,
  ) {}

  async toggleSave(userId: string, postId: string) {
    const existingSave = await this.saveRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (existingSave) {
      await this.saveRepository.remove(existingSave);
      return { saved: false };
    } else {
      const newSave = this.saveRepository.create({
        user: { id: userId } as any,
        post: { id: postId } as any,
      });
      await this.saveRepository.save(newSave);
      return { saved: true };
    }
  }

  async isSaved(userId: string, postId: string) {
    const count = await this.saveRepository.count({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });
    return count > 0;
  }
}
