import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('webhook')
  async handleClerkWebhook(@Body() body: ClerkWebhookEvent) {
    const { data, type } = body;

    if (type === 'user.created' || type === 'user.updated') {
      const email = data.email_addresses?.[0]?.email_address as
        | string
        | undefined;
      const firstName = (data.first_name as string) || '';
      const lastName = (data.last_name as string) || '';

      const phoneArray = data.phone_numbers as
        | Array<{ phone_number: string }>
        | undefined;
      const phoneNumber = phoneArray?.[0]?.phone_number;

      await this.usersService.upsertClerkUser({
        clerkId: data.id as string,
        email: email || '',
        fullName: `${firstName} ${lastName}`.trim(),
        phoneNumber: phoneNumber || undefined,
        profilePhoto: data.image_url as string,
      });
    }

    return { received: true };
  }
}

interface ClerkWebhookEvent {
  data: any;
  type: string;
}
