import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './auth/clerk-auth.guard';

// ===== MODULES =====
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PinnedSchoolsModule } from './pinned_schools/pinned_schools.module';
import { PostCommentsModule } from './post_comments/post_comments.module';
import { PostMediaModule } from './post_media/post_media.module';
import { PostSavesModule } from './post_saves/post_saves.module';
import { PostSharesModule } from './post_shares/post_shares.module';
import { PostReportsModule } from './post_reports/post_reports.module';
import { SchoolsModule } from './schools/schools.module';
import { SchoolsCommentsModule } from './schools_comments/schools_comments.module';
import { SchoolsPhotosModule } from './schools_photos/schools_photos.module';
import { SchoolsPostsModule } from './schools_posts/schools_posts.module';
import { UsersModule } from './users/users.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables d'env disponibles partout
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.PROD_POSTGRES_URL,
        autoLoadEntities: true,
        synchronize: true, // Garde le pour l'instant si tu veux créer tes tables
        ssl: {
          rejectUnauthorized: false, // INDISPENSABLE pour Supabase
        },
      }),
    }),
    // BUSINESS MODULES
    UsersModule,
    SchoolsModule,
    SchoolsPhotosModule,
    SchoolsPostsModule,
    SchoolsCommentsModule,
    PinnedSchoolsModule,
    PostMediaModule,
    PostSharesModule,
    PostCommentsModule,
    PostSavesModule,
    CloudinaryModule,
    AuthModule,
    PostReportsModule,
    NotificationsModule,
    ShareModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}
