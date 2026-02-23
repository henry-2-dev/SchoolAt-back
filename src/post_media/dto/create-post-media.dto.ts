import { MediaType } from '../../common/enums/media_type.enum';

export class CreatePostMediaDto {
  type: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  position?: number;
  postId: string;
}
