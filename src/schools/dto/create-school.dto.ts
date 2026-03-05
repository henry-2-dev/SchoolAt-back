export class CreateSchoolDto {
  supabaseId?: string;
  clerkId?: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  latitude: number;
  longitude: number;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  profilePhoto?: string;
  coverPhoto?: string;
}
