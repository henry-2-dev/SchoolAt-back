import { PostType } from '../../common/enums/post_type.enum';
import { MediaType } from '../../common/enums/media_type.enum';

export class CreateSchoolPostDto {
  type: PostType;
  content: string;
  description?: string;
  schoolId: string;
  media?: Array<{
    mediaUrl: string;
    type: MediaType;
    position?: number;
  }>;
}
