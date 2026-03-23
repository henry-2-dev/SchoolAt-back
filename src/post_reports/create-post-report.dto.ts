export class CreatePostReportDto {
  postId: string;
  userId: string;
  reason: string;
  details?: string;
}
