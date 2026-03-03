import { Body, Controller, Post } from '@nestjs/common';
import { PostSavesService } from './post_saves.service';

@Controller('post-saves')
export class PostSavesController {
  constructor(private readonly postSavesService: PostSavesService) {}

  @Post('toggle')
  async toggle(@Body() body: { userId: string; postId: string }) {
    return this.postSavesService.toggleSave(body.userId, body.postId);
  }

  @Post('is-saved')
  async isSaved(@Body() body: { userId: string; postId: string }) {
    const saved = await this.postSavesService.isSaved(body.userId, body.postId);
    return { saved };
  }

  @Post('user')
  async getUserSaves(@Body() body: { userId: string }) {
    return this.postSavesService.getUserSaves(body.userId);
  }
}
