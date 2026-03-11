import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserPinnedSchool } from './pinned-schools.entity';

@Injectable()
export class PinnedSchoolsService {
  constructor(
    @InjectRepository(UserPinnedSchool)
    private readonly pinnedRepository: Repository<UserPinnedSchool>,
    private readonly usersService: UsersService,
  ) {}

  async togglePin(userId: string, schoolId: string) {
    const user = await this.usersService.findByIdOrClerkId(userId);
    if (!user) throw new NotFoundException('User not found');

    const existingPin = await this.pinnedRepository.findOne({
      where: {
        user: { id: user.id },
        school: { id: schoolId },
      },
    });

    if (existingPin) {
      await this.pinnedRepository.remove(existingPin);
      return { pinned: false };
    } else {
      const newPin = this.pinnedRepository.create({
        user: user,
        school: { id: schoolId } as any,
      });
      await this.pinnedRepository.save(newPin);
      return { pinned: true };
    }
  }

  async getUserPinnedSchools(userId: string) {
    const user = await this.usersService.findByIdOrClerkId(userId);
    if (!user) throw new NotFoundException('User not found');

    const pins = await this.pinnedRepository.find({
      where: { user: { id: user.id } },
      relations: ['school', 'school.photos', 'school.comments'],
    });

    return pins.map((pin) => {
      const school = pin.school;
      const rating =
        school.comments && school.comments.length > 0
          ? school.comments.reduce((acc, c) => acc + c.rating, 0) /
            school.comments.length
          : 0;

      return {
        id: school.id,
        name: school.name,
        city: school.city,
        coverImageUrl: school.coverPhoto,
        profilePhoto: school.profilePhoto,
        type: school.type,
        rating: parseFloat(rating.toFixed(1)),
        isPinned: true,
      };
    });
  }
}
