import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
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

  /**
   * Trouve un utilisateur par son ID (UUID) ou son clerkId.
   */
  async findByIdOrClerkId(idOrClerkId: string): Promise<User | null> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrClerkId,
      );

    return this.userRepository.findOne({
      where: isUuid ? { id: idOrClerkId } : { clerkId: idOrClerkId },
    });
  }

  async findAll() {
    return await this.userRepository.find({
      relations: ['postComments', 'postShares', 'pinnedSchools'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['postComments', 'postShares', 'pinnedSchools'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.userRepository.update(id, dto);
    return this.findOne(id);
  }

  async updateByClerkId(clerkId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { clerkId } });
    if (!user)
      throw new NotFoundException('User not found for clerkId: ' + clerkId);
    await this.userRepository.update(user.id, dto);
    return this.findOne(user.id);
  }

  async upsertClerkUser(dto: CreateUserDto) {
    console.log('[UsersService] Upsert user for clerkId:', dto.clerkId);

    if (!dto.clerkId) {
      console.error('[UsersService] Sync failed: clerkId is missing in DTO');
      throw new Error('clerkId is required for sync');
    }

    try {
      let user = await this.userRepository.findOne({
        where: { clerkId: dto.clerkId },
      });

      if (!user && dto.email) {
        user = await this.userRepository.findOne({
          where: { email: dto.email },
        });
      }

      if (user) {
        console.log('[UsersService] Found existing user, updating...');

        // Preserve the custom profile photo: only update profilePhoto from Clerk
        // if the user has not set a custom one (i.e., it's still the Clerk default or null).
        // A custom photo is one that does NOT start with "https://img.clerk.com"
        const hasCustomPhoto =
          user.profilePhoto &&
          !user.profilePhoto.startsWith('https://img.clerk.com');

        const mergedData = {
          ...user,
          ...dto,
          profilePhoto: hasCustomPhoto ? user.profilePhoto : dto.profilePhoto,
        };

        return await this.userRepository.save(mergedData);
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

  async findProfileUserByClerkOrId(
    idOrClerkId: string,
  ): Promise<UserProfileDto | null> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrClerkId,
      );

    const user = await this.userRepository.findOne({
      where: isUuid ? { id: idOrClerkId } : { clerkId: idOrClerkId },
      relations: ['pinnedSchools', 'pinnedSchools.school', 'schoolComments'],
    });

    if (!user) return null;

    return {
      id: user.id,
      clerkId: user.clerkId,
      fullName: user.fullName,
      email: user.email,
      profilePhoto: user.profilePhoto ?? '',
      phoneNumber: user.phoneNumber ?? '',
      city: user.city || 'Cameroun',
      role: user.role,
      stats: {
        schoolsFollowed: user.pinnedSchools?.length || 0,
        comments: user.schoolComments?.length || 0,
        pins: user.pinnedSchools?.length || 0, // Idem que followed pour l'instant
      },
      pinnedSchools:
        user.pinnedSchools?.map((pin) => ({
          id: pin.school?.id,
          name: pin.school?.name,
          profilePhoto: pin.school?.profilePhoto || '',
          city: pin.school?.city || '',
        })) || [],
    };
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
