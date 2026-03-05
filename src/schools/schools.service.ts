import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PROFILESCHOOL, SchoolGeoDTO } from 'src/feeddto';
import { ILike, Repository } from 'typeorm';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './schools.entity';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async findProfileSchoolById(
    id: string,
    userId?: string,
  ): Promise<PROFILESCHOOL | null> {
    const school = await this.schoolRepository.findOne({
      where: { id },
      relations: [
        'posts',
        'photos',
        'comments',
        'pinnedBy',
        'pinnedBy.user',
        'comments.user',
      ],
    });
    if (!school) return null;
    return {
      idschool: school.id,
      coverimageschool: school.coverPhoto ?? '',
      ppschool: school.profilePhoto ?? '',
      nameschool: school.name,
      isuserpinned: userId
        ? !!school.pinnedBy?.find((pin) => pin.user?.id === userId)
        : false,
      nbpostschool: school.posts ? school.posts.length : 0,
      nbepingle: school.pinnedBy ? school.pinnedBy.length : 0,
      nbavis: school.comments ? school.comments.length : 0,
      datecreationaccount: school.createdAt,
      mediaschool: school.photos
        ? school.photos.map((photo) => ({ id: photo.id, url: photo.photoUrl }))
        : [],
      descriptionschool: school.description ?? '',
      avisschool: school.comments
        ? school.comments.map((comment) => ({
            id: comment.id,
            ppuser: comment.user?.profilePhoto ?? '',
            username: comment.user?.fullName ?? '',
            contain: comment.content ?? '',
          }))
        : [],
    };
  }

  async create(dto: CreateSchoolDto) {
    const school = this.schoolRepository.create(dto);
    return this.schoolRepository.save(school);
  }

  async upsertClerkSchool(dto: CreateSchoolDto) {
    const school = await this.schoolRepository.findOne({
      where: { clerkId: dto.clerkId },
    });

    if (school) {
      return await this.schoolRepository.save({ ...school, ...dto });
    }

    const newSchool = this.schoolRepository.create(dto);
    return await this.schoolRepository.save(newSchool);
  }

  async findAll() {
    return this.schoolRepository.find({
      relations: ['posts', 'photos', 'comments', 'pinnedBy'],
    });
  }

  async findOne(id: string) {
    const school = await this.schoolRepository.findOne({
      where: { id },
      relations: ['posts', 'photos', 'comments', 'pinnedBy'],
    });

    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    await this.schoolRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.schoolRepository.delete(id);
  }

  /**
   * Retourne les écoles pour la carte avec la distance calculée, triées par proximité.
   * Utilise la formule de Haversine pour le calcul de distance en km.
   */
  async findNearbySchools(
    userLat?: number,
    userLng?: number,
    radiusInKm: number = 50,
    searchQuery?: string,
  ): Promise<SchoolGeoDTO[]> {
    const findOptions: any = {
      relations: ['comments'], // Nécessaire pour le rating/isTopSchool
    };

    if (searchQuery) {
      const cleanQuery = searchQuery.trim();
      // Recherche insensible à la casse dans le nom ou la ville
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      findOptions.where = [
        { name: ILike(`%${cleanQuery}%`) },
        { city: ILike(`%${cleanQuery}%`) },
      ];
    }

    const schools = await this.schoolRepository.find(findOptions);

    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371; // Rayon de la Terre en km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let mappedSchools = schools.map((school) => {
      // Calcul du rating moyen
      const rating =
        school.comments && school.comments.length > 0
          ? school.comments.reduce((acc, c) => acc + c.rating, 0) /
            school.comments.length
          : 0;

      // Calcul de la distance si les coordonnées utilisateur sont fournies
      let distance: number | undefined = undefined;
      if (userLat !== undefined && userLng !== undefined) {
        distance = calculateDistance(
          userLat,
          userLng,
          Number(school.latitude),
          Number(school.longitude),
        );
      }

      // Logique métier : "Top école" si note >= 4.0 et au moins 5 avis (exemple)
      const isTopSchool = rating >= 4.0 && school.comments.length >= 5;

      const dto: SchoolGeoDTO = {
        id: school.id,
        name: school.name,
        location: {
          lat: Number(school.latitude),
          lng: Number(school.longitude),
        },
        city: school.city,
        rating: parseFloat(rating.toFixed(1)),
        distance:
          distance !== undefined ? parseFloat(distance.toFixed(2)) : undefined,
        isTopSchool,
        coverImageUrl: school.coverPhoto ?? '',
      };

      return dto;
    });

    // Filtre par rayon si des coordonnées sont fournies
    if (userLat !== undefined && userLng !== undefined) {
      mappedSchools = mappedSchools.filter(
        (s) => s.distance !== undefined && s.distance <= radiusInKm,
      );
      // Tri par distance
      mappedSchools.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return mappedSchools;
  }
}
