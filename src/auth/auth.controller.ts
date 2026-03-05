import type { RawBodyRequest } from '@nestjs/common';
import {
    BadRequestException,
    Body,
    Controller,
    Headers,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Vérifie la signature Clerk du webhook selon le protocole svix/HMAC-SHA256.
   * Utilise uniquement le module `crypto` natif de Node.js.
   */
  private verifyClerkSignature(
    rawBody: Buffer,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
  ): void {
    console.log('[Webhook] Début vérification signature...');
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Webhook] ERREUR: CLERK_WEBHOOK_SECRET non défini');
      throw new Error(
        "CLERK_WEBHOOK_SECRET non défini dans les variables d'env",
      );
    }

    // 1. Vérifier que le timestamp n'est pas trop vieux (tolérance 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(svixTimestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      console.error('[Webhook] ERREUR: Timestamp invalide ou trop vieux', {
        now,
        ts,
      });
      throw new UnauthorizedException('Webhook timestamp trop ancien ou futur');
    }

    // 2. Construire le message signé
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`;

    // 3. Décoder le secret
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');

    // 4. Calculer HMAC-SHA256
    const computedHmac = createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');

    // 5. Comparer avec chaque signature envoyée
    const signatures = svixSignature.split(' ');
    const isValid = signatures.some((sig) => {
      const sigValue = sig.replace(/^v1,/, '');
      try {
        const match = timingSafeEqual(
          Buffer.from(computedHmac, 'base64'),
          Buffer.from(sigValue, 'base64'),
        );
        return match;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return false;
      }
    });

    if (!isValid) {
      console.error('[Webhook] ERREUR: Signature invalide');
      throw new UnauthorizedException('Signature Clerk invalide');
    }
    console.log('[Webhook] Signature validée ✅');
  }

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
        let phoneNumber = phoneArray?.[0]?.phone_number;

        if (!phoneNumber) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          phoneNumber = data.unsafe_metadata?.phoneNumber as string | undefined;
        }

        console.log(`[Webhook] Sync utilisateur: ${email}`);

        await this.usersService.upsertClerkUser({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          clerkId: data.id as string,
          email: email || '',
          fullName: `${firstName} ${lastName}`.trim(),
          phoneNumber: phoneNumber || undefined,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          profilePhoto: data.image_url as string,
        });

        console.log(
          `[Webhook] Utilisateur ${email} synchronisé avec succès ✅`,
        );
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
