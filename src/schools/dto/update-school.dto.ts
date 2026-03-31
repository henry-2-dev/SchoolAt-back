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
  curriculum?: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  isVerified?: boolean;
  documentVerification?: string;
  immatriculation?: string;
}
