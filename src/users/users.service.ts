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
    const user = await this.userRepository.findOne({
      where: { clerkId: dto.clerkId },
    });

    if (user) {
      return await this.userRepository.save({ ...user, ...dto });
    }

    const newUser = this.userRepository.create(dto);
    return await this.userRepository.save(newUser);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
