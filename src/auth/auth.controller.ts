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
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error(
        "CLERK_WEBHOOK_SECRET non défini dans les variables d'env",
      );
    }

    // 1. Vérifier que le timestamp n'est pas trop vieux (tolérance 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(svixTimestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      throw new UnauthorizedException('Webhook timestamp trop ancien ou futur');
    }

    // 2. Construire le message signé : "{svix-id}.{svix-timestamp}.{rawBody}"
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`;

    // 3. Décoder le secret (format: "whsec_BASE64")
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');

    // 4. Calculer HMAC-SHA256
    const computedHmac = createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');

    // 5. Comparer avec chaque signature envoyée (format : "v1,BASE64 v1,BASE64 ...")
    const signatures = svixSignature.split(' ');
    const isValid = signatures.some((sig) => {
      const sigValue = sig.replace(/^v1,/, '');
      try {
        return timingSafeEqual(
          Buffer.from(computedHmac, 'base64'),
          Buffer.from(sigValue, 'base64'),
        );
      } catch {
        return false;
      }
    });

    if (!isValid) {
      throw new UnauthorizedException('Signature Clerk invalide');
    }
  }

  @Post('webhook')
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: ClerkWebhookEvent,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    // Vérification de la signature
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('En-têtes svix manquants');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body indisponible');
    }

    this.verifyClerkSignature(rawBody, svixId, svixTimestamp, svixSignature);

    // Traitement de l'événement
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
      let phoneNumber = phoneArray?.[0]?.phone_number;

      // Fallback sur unsafe_metadata si le champ officiel est vide (Cameroun/Autre non supporté par Clerk)
      if (!phoneNumber) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        phoneNumber = data.unsafe_metadata?.phoneNumber as string | undefined;
      }

      // Upsert de l'utilisateur
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
        `[Webhook] Utilisateur ${type === 'user.created' ? 'créé' : 'mis à jour'}: ${email}`,
      );
    }

    return { received: true };
  }
}

interface ClerkWebhookEvent {
  data: any;
  type: string;
}
