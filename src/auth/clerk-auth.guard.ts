import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/clerk-sdk-node';
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

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('En-tête Authorization manquant ou invalide');
    }

    const token = authHeader.split(' ')[1];

    try {
      // clerkClient.verifyToken verifies JWT signature using Clerk JWKS
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      } as any);

      // Inject validated user payload into request
      request.user = { id: decoded.sub };
      return true;
    } catch (error) {
      console.error('[ClerkAuthGuard] Échec vérification token:', error);
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }
}
