import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  clerkId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePhoto?: string;
  role?: Role;
}
