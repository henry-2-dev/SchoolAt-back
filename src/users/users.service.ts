import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return await this.userRepository.save(user);
  }

  async findAll() {
    return await this.userRepository.find({
      relations: ['posts', 'comments', 'shares', 'pinnedSchools'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts', 'comments', 'shares', 'pinnedSchools'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.userRepository.update(id, dto);
    return this.findOne(id);
  }

  async upsertClerkUser(dto: CreateUserDto) {
    console.log('[UsersService] Upsert user for clerkId:', dto.clerkId);

    if (!dto.clerkId) {
      console.error('[UsersService] Sync failed: clerkId is missing in DTO');
      throw new Error('clerkId is required for sync');
    }

    try {
      const user = await this.userRepository.findOne({
        where: { clerkId: dto.clerkId },
      });

      if (user) {
        console.log('[UsersService] Found existing user, updating...');
        return await this.userRepository.save({ ...user, ...dto });
      }

      console.log('[UsersService] Creating new user record...');
      const newUser = this.userRepository.create(dto);
      const saved = await this.userRepository.save(newUser);
      console.log(
        '[UsersService] New user saved successfully with ID:',
        saved.id,
      );
      return saved;
    } catch (error) {
      console.error('[UsersService] Error during user upsert:', error);
      throw error;
    }
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
