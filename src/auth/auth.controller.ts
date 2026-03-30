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
import { SchoolsService } from '../schools/schools.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly schoolsService: SchoolsService,
  ) {}

  /**
   * Vérifie la signature Clerk du webhook selon le protocole svix/HMAC-SHA256.
   */
  private verifyClerkSignature(
    rawBody: Buffer,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
  ): void {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Webhook] ERREUR: CLERK_WEBHOOK_SECRET non défini');
      throw new Error(
        "CLERK_WEBHOOK_SECRET non défini dans les variables d'env",
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const ts = parseInt(svixTimestamp, 10);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      throw new UnauthorizedException('Webhook timestamp trop ancien ou futur');
    }

    const signedContent = `${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`;
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const computedHmac = createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');

    const signatures = svixSignature.split(' ');
    const isValid = signatures.some((sig) => {
      const sigValue = sig.replace(/^v1,/, '');
      try {
        return timingSafeEqual(
          Buffer.from(computedHmac, 'base64'),
          Buffer.from(sigValue, 'base64'),
        );
      } catch (e) {
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
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('En-têtes svix manquants');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body indisponible');
    }

    try {
      this.verifyClerkSignature(rawBody, svixId, svixTimestamp, svixSignature);
    } catch (e: any) {
      console.error('[Webhook] Échec vérification signature:', e.message);
      throw e;
    }

    const { data, type } = body;
    console.log(`[Webhook] Événement: ${type}`);

    if (type === 'user.created' || type === 'user.updated') {
      try {
        const email =
          (data.email_addresses?.[0]?.email_address as string) || '';
        const accountType =
          (data.unsafe_metadata?.accountType as string) || 'user';
        const clerkId = data.id as string;

        console.log(`[Webhook] Sync ${accountType}: ${email} (${clerkId})`);

        if (accountType === 'school') {
          const metadata = data.unsafe_metadata || {};
          // Upsert in schools table
          await this.schoolsService.upsertClerkSchool({
            clerkId,
            name:
              (metadata.fullName as string) ||
              (data.first_name as string) ||
              email,
            email: email,
            type: metadata.schoolType as string,
            status: metadata.schoolStatus as string,
            city: metadata.city as string,
            latitude: metadata.latitude as number,
            longitude: metadata.longitude as number,
            phone:
              (metadata.phoneNumber as string) ||
              (data.phone_numbers?.[0]?.phone_number as string),
          });

          // ALSO sync as a "Shadow User" to enable social features (saves, shares, etc.)
          await this.usersService.upsertClerkUser({
            clerkId,
            email: email,
            fullName:
              (metadata.fullName as string) ||
              (data.first_name as string) ||
              email,
            phoneNumber: (metadata.phoneNumber as string) || (data.phone_numbers?.[0]?.phone_number as string),
            profilePhoto: data.image_url as string,
          });

          console.log(`[Webhook] École ${email} synchronisée (School + User) ✅`);
        } else {
          const firstName = (data.first_name as string) || '';
          const lastName = (data.last_name as string) || '';
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

  @Post('sync')
  async syncUser(@Body() dto: any) {
    try {
      const user = await this.usersService.upsertClerkUser({
        clerkId: dto.clerkId,
        email: dto.email,
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        profilePhoto: dto.profilePhoto,
      });
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
