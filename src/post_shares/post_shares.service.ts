import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreatePostShareDto } from './dto/create-post-share.dto';
import { PostShare } from './post-shares.entity';

@Injectable()
export class PostSharesService {
  constructor(
    @InjectRepository(PostShare)
    private readonly shareRepository: Repository<PostShare>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreatePostShareDto) {
    const user = await this.usersService.findByIdOrClerkId(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    const share = this.shareRepository.create({
      user: user,
      post: { id: dto.postId },
    } as any);
    return this.shareRepository.save(share);
  }

  findAll() {
    return this.shareRepository.find({
      relations: ['post', 'user'],
    });
  }

  async findOne(id: string) {
    const share = await this.shareRepository.findOne({
      where: { id },
      relations: ['post', 'user'],
    });

    if (!share) throw new NotFoundException('Share not found');
    return share;
  }

  remove(id: string) {
    return this.shareRepository.delete(id);
  }
}
