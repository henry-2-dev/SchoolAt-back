import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { SchoolsService } from '../schools/schools.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserPinnedSchool } from './pinned-schools.entity';

@Injectable()
export class PinnedSchoolsService {
  constructor(
    @InjectRepository(UserPinnedSchool)
    private readonly pinnedRepository: Repository<UserPinnedSchool>,
    private readonly usersService: UsersService,
    private readonly schoolsService: SchoolsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async togglePin(userId: string, schoolId: string) {
    let pinnerUser = await this.usersService.findByIdOrClerkId(userId);
    let pinnerSchool: any = null;

    if (!pinnerUser) {
      pinnerSchool = await this.schoolsService.findByIdOrClerkId(userId);
      if (!pinnerSchool) throw new NotFoundException('User or School not found');
    }

    const whereClause = pinnerUser
      ? { user: { id: pinnerUser.id }, school: { id: schoolId } }
      : { pinnerSchool: { id: pinnerSchool.id }, school: { id: schoolId } };

    const existingPin = await this.pinnedRepository.findOne({
      where: whereClause as any,
    });

    if (existingPin) {
      await this.pinnedRepository.remove(existingPin);
      return { pinned: false };
    } else {
      const newPin = this.pinnedRepository.create({
        user: pinnerUser as any,
        pinnerSchool: pinnerSchool as any,
        school: { id: schoolId } as any,
      });
      await this.pinnedRepository.save(newPin);

      // Notify the school that someone pinned them
      try {
        const pinnerName = pinnerUser ? pinnerUser.fullName : (pinnerSchool ? pinnerSchool.name : 'Quelqu\'un');
        const pinnerId = pinnerUser ? pinnerUser.id : (pinnerSchool ? pinnerSchool.id : userId);
        
        await this.notificationsService.notifyUser(
          schoolId,
          '📌 Nouveau follower !',
          `${pinnerName} a épinglé votre établissement.`,
          { type: 'pin', userId: pinnerId },
        );
      } catch (e) {
        console.warn('[Notifications] Could not notify school on pin:', e?.message);
      }

      return { pinned: true };
    }
  }

  async getUserPinnedSchools(userId: string) {
    let pinnerUser = await this.usersService.findByIdOrClerkId(userId);
    let pinnerSchool: any = null;

    if (!pinnerUser) {
      pinnerSchool = await this.schoolsService.findByIdOrClerkId(userId);
      if (!pinnerSchool) throw new NotFoundException('User or School not found');
    }

    const whereClause = pinnerUser
      ? { user: { id: pinnerUser.id } }
      : { pinnerSchool: { id: pinnerSchool.id } };

    const pins = await this.pinnedRepository.find({
      where: whereClause as any,
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
