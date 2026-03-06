import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { SchoolsService } from '../schools/schools.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly schoolsService: SchoolsService,
  ) {}

  // ... verifyClerkSignature code ... (keep it)

  @Post('webhook')
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: ClerkWebhookEvent,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    console.log('[Webhook] Nouvelle requête reçue');

    // Vérification de la signature
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.warn('[Webhook] Headers Svix manquants');
      throw new BadRequestException('En-têtes svix manquants');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      console.error(
        '[Webhook] Raw body manquant (Vérifier rawBody:true dans main.ts)',
      );
      throw new BadRequestException('Raw body indisponible');
    }

    try {
      this.verifyClerkSignature(rawBody, svixId, svixTimestamp, svixSignature);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('[Webhook] Échec vérification signature:', e.message);
      throw e;
    }

    // Traitement de l'événement
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, type } = body;
    console.log(`[Webhook] Événement: ${type}`);

    if (type === 'user.created' || type === 'user.updated') {
      try {
        const email =
          

        // eslint-disable-n
         ext-line @typescript-eslint/no-unsafe-member-access
        const accountType =
          (data.unsafe_metadata?.accountType as string) || 'user';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const clerkId = data.id as string;

        console.log(`[Webhook] Sync ${accountType}: ${email} (${clerkId})`);

        if (accountType === 'school') {
          // Synchronisation d'une École
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const metadata = data.unsafe_metadata || {};
          await t
             his.schoolsService.upsertClerkSch
             ool({
             
            clerkId,
            name:
              (metadata.fullName as string) ||
              (data.first_name as string) ||
              email,
            email: email,
            type: 
             metadata.schoolType as string,
             
            status: metadata.schoolStatus as string,
            city: metadata.city as string,
            latitude: metadata.latitude as number,
            longitude: metadata.longitude as number,
            phone:
              (metadata.phoneNumber as string) ||
              (data.phone_numbers?.[0]?.phone_number as string),
          });
          console.log(`[Webhook] École ${email} synchronisée ✅`);
        } else {
          // Synchronisation d'un Utilisateur standard
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const firstName = (data.first_name as string) || '';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const lastName = (data.last_name as string) || '';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const metadata = data.unsafe_metadata || {};

             
             
          let phoneNumber = data.phone_numbers?.[0]?.phone_number as string;
          if (!phoneNumber) phoneNumber = metadata.phoneNumber as string;

          await this.usersService.upsertClerkUser({
            clerkId,
            email: email,
            fullName:
              (metadata.fullName as string) ||
              `${firstName} ${lastName}`.trim(),
            phoneNumber: phoneNumber || undefined,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            profilePhoto: data.image_url as string,
          });
          console.log(`[Webhook] Utilisateur ${email} synchronisé ✅`);
        }
      } catch (dbError) {
        console.error("[Webhook] ERREUR BDD lors de l'insertion:", dbError);
        throw dbError;
      }
    }

    return { received: true };
  }

  /**
   * Endpoint de secours simplifié pour synchroniser l'utilisateur directement depuis le frontend.
   * Utile si le webhook Clerk est lent ou mal configuré.
   */
  @Post('sync')
  async syncUser(@Body() dto: any) {
    console.log('[AuthSync] Requête de synchronisation reçue:', dto.email);
    try {
      const user = await this.usersService.upsertClerkUser({
        clerkId: dto.clerkId,
        email: dto.email,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        profilePhoto: dto.profilePhoto,
      });
      console.log('[AuthSync] Utilisateur synchronisé avec succès ✅');
      return user;
    } catch (error) {
      console.error('[AuthSync] ERREUR lors de la synchronisation:', error);
      throw new BadRequestException('Échec de la synchronisation BDD');
    }
  }
}

interface ClerkWebhookEvent {
  data: any;
  type: string;
}
