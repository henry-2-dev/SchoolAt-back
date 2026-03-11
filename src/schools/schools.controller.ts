import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { SchoolsService } from './schools.service';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }

  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get('geo')
  findNearbySchools(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;
    const radiusKm = radius ? parseFloat(radius) : 50;

    return this.schoolsService.findNearbySchools(
      userLat,
      userLng,
      radiusKm,
      q,
      type,
      status,
    );
  }

  @Get(':id/profile')
  findProfileSchoolById(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return this.schoolsService.findProfileSchoolById(id, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }

  @Post('sync')
  syncSchool(@Body() dto: CreateSchoolDto) {
    console.log('[SchoolSync] Synchronisation reçue pour:', dto.name);
    return this.schoolsService.upsertClerkSchool(dto);
  }
}
