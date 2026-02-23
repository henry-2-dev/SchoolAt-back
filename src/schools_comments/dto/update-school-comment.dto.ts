import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolCommentDto } from './create-school-comment.dto';

export class UpdateSchoolCommentDto extends PartialType(
  CreateSchoolCommentDto,
) {}
