import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('webhook')
  async handleClerkWebhook(@Body() body: ClerkWebhookEvent) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, type } = body;

    if (type === 'user.created' || type === 'user.updated') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const email = data.email_addresses?.[0]?.email_address as
        | string
        | undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const firstName = (data.first_name as string) || '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const lastName = (data.last_name as string) || '';

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const phoneArray = data.phone_numbers as
        | Array<{ phone_number: string }>
        | undefined;
      const phoneNumber = phoneArray?.[0]?.phone_number;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await this.usersService.upsertClerkUser({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        clerkId: data.id as string,
        email: email || '',
        fullName: `${firstName} ${lastName}`.trim(),
        phoneNumber: phoneNumber || undefined,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
