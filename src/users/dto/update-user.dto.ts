import { Role } from '../../common/enums/role.enum';

export class UpdateUserDto {
  supabaseId?: string;
  fullName?: string;
  email?: string;
  profilePhoto?: string;
  role?: Role;
}
