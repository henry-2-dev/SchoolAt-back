import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Pas de token → laisse passer sans user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token = authHeader.split(' ')[1];

    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Format JWT invalide');

      const payloadBase64 = parts[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson);

      const now = Math.floor(Date.now() / 1000);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (payload.exp && payload.exp < now) {
        console.warn(`[ClerkAuthGuard] Token expiré pour: ${payload.sub}`);
        request.user = null;
        return true;
      }

      console.log(`[ClerkAuthGuard] ✅ User identifié: ${payload.sub}`);
      request.user = { id: payload.sub, clerkId: payload.sub };
      return true;

    } catch (error) {
      console.warn(`[ClerkAuthGuard] ⚠️ Erreur: ${error.message} — accès permis sans user`);
      request.user = null;
      return true;
    }
  }
}
