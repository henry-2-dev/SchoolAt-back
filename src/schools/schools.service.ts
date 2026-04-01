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

  /**
   * Récupère le profil d'une école par son ID (UUID) ou son clerkId.
   */
  async findProfileSchoolById(
    idOrClerkId: string,
    userId?: string,
  ): Promise<PROFILESCHOOL | null> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrClerkId,
      );

    const school = await this.schoolRepository.findOne({
      where: isUuid ? { id: idOrClerkId } : { clerkId: idOrClerkId },
      relations: [
        'posts',
        'posts.media',
        'posts.comments',
        'posts.comments.user',
        'posts.saves',
        'posts.shares',
        'photos',
        'pinnedBy',
        'pinnedBy.user',
        'pinnedBy.pinnerSchool',
        'comments.user',
      ],
    });
    if (!school) return null;

    // Incrémenter les vues si le visiteur n'est pas l'école elle-même
    if (userId && school.clerkId !== userId) {
      await this.schoolRepository.increment({ id: school.id }, 'views', 1);
      school.views += 1;
    }

    return {
      idschool: school.id,
      clerkid: school.clerkId,
      coverimageschool: school.coverPhoto ?? '',
      ppschool: school.profilePhoto ?? '',
      nameschool: school.name,
      isuserpinned: userId
        ? !!school.pinnedBy?.find((pin) => 
            pin.user?.id === userId || pin.user?.clerkId === userId ||
            pin.pinnerSchool?.id === userId || pin.pinnerSchool?.clerkId === userId
          )
        : false,
      nbpostschool: school.posts ? school.posts.length : 0,
      nbepingle: school.pinnedBy ? school.pinnedBy.length : 0,
      nbavis: school.comments ? school.comments.length : 0,
      nbviewsschool: school.views || 0,
      datecreationaccount: school.createdAt,
      isVerified: school.isVerified || false,
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
      address: school.address,
      email: school.email,
      phone: school.phone,
      website: school.website,
      status: school.status,
      type: school.type,
      curriculum: school.curriculum,
      immatriculation: school.immatriculation ?? '',
      affiliation: school.affiliation,
      boarding: school.boarding,
      city: school.city,
      latitude: school.latitude,
      longitude: school.longitude,
      posts: school.posts
        ? school.posts.map((post) => ({
            idPost: post.id,
            ppschool: school.profilePhoto,
            nameschool: school.name,
            levelschool: school.type,
            cituschool: school.city,
            isVerified: school.isVerified ?? false,
            timeposted: post.createdAt,
            descriptionpost: post.description,
            message: post.content,
            type: post.type,
            containpost: post.media
              ? post.media.map((m) => ({
                  id: m.id,
                  url: m.mediaUrl,
                  type: m.type,
                }))
              : [],
            nbviewpost: post.views,
            nbcommentpost: post.comments ? post.comments.length : 0,
            nbsavepost: post.saves ? post.saves.length : 0,
            nbsharepost: post.shares ? post.shares.length : 0,
            commentpost: post.comments
              ? post.comments.map((c) => ({
                  id: c.id,
                  message: c.content,
                  ppuser: c.user?.profilePhoto,
                  nameuser: c.user?.fullName,
                  datetimecomment: c.createdAt,
                }))
              : [],
          }))
        : [],
    };
  }

  /**
   * Trouve une école par son ID (UUID) ou son clerkId.
   */
  async findByIdOrClerkId(idOrClerkId: string): Promise<School | null> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrClerkId,
      );

    return this.schoolRepository.findOne({
      where: isUuid ? { id: idOrClerkId } : { clerkId: idOrClerkId },
    });
  }

  async create(dto: CreateSchoolDto) {
    const school = this.schoolRepository.create(dto);
    return this.schoolRepository.save(school);
  }

  async upsertClerkSchool(dto: CreateSchoolDto) {
    console.log('[SchoolsService] Upsert school for clerkId:', dto.clerkId);

    if (!dto.clerkId) {
      console.error('[SchoolsService] Sync failed: clerkId is missing in DTO');
      throw new Error('clerkId is required for sync');
    }

    try {
      let school = await this.schoolRepository.findOne({
        where: { clerkId: dto.clerkId },
      });

      if (!school && dto.email) {
        school = await this.schoolRepository.findOne({
          where: { email: dto.email },
        });
      }

      if (school) {
        console.log('[SchoolsService] Found existing school, updating...');
        return await this.schoolRepository.save({ ...school, ...dto });
      }

      console.log('[SchoolsService] Creating new school record...');
      const newSchool = this.schoolRepository.create(dto);
      const saved = await this.schoolRepository.save(newSchool);
      console.log(
        '[SchoolsService] New school saved successfully with ID:',
        saved.id,
      );
      return saved;
    } catch (error) {
      console.error('[SchoolsService] Error during upsert:', error);
      throw error;
    }
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

  async updateByClerkId(clerkId: string, dto: UpdateSchoolDto) {
    const school = await this.schoolRepository.findOne({ where: { clerkId } });
    if (!school) throw new NotFoundException('School not found');
    await this.schoolRepository.update(school.id, dto);
    return this.findOne(school.id);
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
    type?: string,
    status?: string,
    language?: string,
  ): Promise<SchoolGeoDTO[]> {
    const queryBuilder = this.schoolRepository.createQueryBuilder('school');
    queryBuilder.leftJoinAndSelect('school.comments', 'comments');

    // Conditions de filtrage de base
    if (searchQuery && searchQuery.trim() !== '') {
      const cleanQuery = searchQuery.trim();
      queryBuilder.andWhere(
        '(school.name ILIKE :q OR school.city ILIKE :q)',
        { q: `%${cleanQuery}%` },
      );
    }

    if (type && type !== 'all') {
      queryBuilder.andWhere('school.type ILIKE :type', { type: `%${type}%` });
    }

    if (status && status !== 'all') {
      queryBuilder.andWhere('school.status = :status', { status });
    }

    if (language && language !== 'all') {
      // Le frontend envoie déjà "Francophone", "Anglophone" ou "Bilingue"
      queryBuilder.andWhere('school.curriculum ILIKE :curriculum', { 
        curriculum: `%${language}%` 
      });
    }

    const schools = await queryBuilder.getMany();

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
        isVerified: school.isVerified || false,
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
