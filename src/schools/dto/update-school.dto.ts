export class UpdateSchoolDto {
  supabaseId?: string;
  name?: string;
  type?: string;
  status?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  profilePhoto?: string;
  coverPhoto?: string;
}
