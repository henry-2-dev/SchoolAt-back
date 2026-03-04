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
import { CreateSchoolPostDto } from './dto/create-school-post.dto';
import { UpdateSchoolPostDto } from './dto/update-school-post.dto';
import { SchoolsPostsService } from './schools_posts.service';

@Controller('school-posts')
export class SchoolsPostsController {
  constructor(private readonly postsService: SchoolsPostsService) {}

  @Post()
  create(@Body() dto: CreateSchoolPostDto) {
    return this.postsService.create(dto);
  }

  @Get('formatted')
  findAllFormatted(@Query('userId') userId?: string) {
    return this.postsService.findAllFormatted(userId);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSchoolPostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
