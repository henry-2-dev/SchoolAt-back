export class UserProfileDto {
  id: string;
  clerkId: string;
  fullName: string;
  email: string;
  profilePhoto: string;
  city: string;
  role: string;
  stats: {
    schoolsFollowed: number;
    comments: number;
    pins: number;
  };
  pinnedSchools: {
    id: string;
    name: string;
    profilePhoto: string;
    city: string;
  }[];
}
