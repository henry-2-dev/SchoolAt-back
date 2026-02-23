import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PostSharesService } from './post_shares.service';
import { CreatePostShareDto } from './dto/create-post-share.dto';

@Controller('post-shares')
export class PostSharesController {
  constructor(private readonly sharesService: PostSharesService) {}

  @Post()
  create(@Body() dto: CreatePostShareDto) {
    return this.sharesService.create(dto);
  }

  @Get()
  findAll() {
    return this.sharesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sharesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sharesService.remove(id);
  }
}
