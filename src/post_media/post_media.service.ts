import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostMedia } from './post-media.entity';
import { CreatePostMediaDto } from './dto/create-post-media.dto';
import { UpdatePostMediaDto } from './dto/update-post-media.dto';

@Injectable()
export class PostMediaService {
  constructor(
    @InjectRepository(PostMedia)
    private readonly mediaRepository: Repository<PostMedia>,
  ) {}

  create(dto: CreatePostMediaDto) {
    const media = this.mediaRepository.create({
      ...dto,
      post: { id: dto.postId } as any,
    });
    return this.mediaRepository.save(media);
  }

  findAll() {
    return this.mediaRepository.find({
      relations: ['post'],
    });
  }

  async findOne(id: string) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async update(id: string, dto: UpdatePostMediaDto) {
    await this.mediaRepository.update(id, dto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.mediaRepository.delete(id);
  }
}
