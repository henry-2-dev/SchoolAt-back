import { MediaType } from '../../common/enums/media_type.enum';

export class UpdatePostMediaDto {
  type?: MediaType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  position?: number;
}
