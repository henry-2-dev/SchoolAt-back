import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  supabaseId?: string;
  fullName?: string;
  email?: string;
  profilePhoto?: string;
  role?: Role;
}
