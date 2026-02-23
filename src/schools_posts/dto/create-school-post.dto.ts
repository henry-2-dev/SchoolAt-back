import { PostType } from '../../common/enums/post_type.enum';

export class CreateSchoolPostDto {
  type: PostType;
  content: string;
  description?: string;
  schoolId: string;
}
