import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// ===== MODULES =====
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { SchoolsPhotosModule } from './schools_photos/schools_photos.module';
import { SchoolsPostsModule } from './schools_posts/schools_posts.module';
import { SchoolsCommentsModule } from './schools_comments/schools_comments.module';
import { PinnedSchoolsModule } from './pinned_schools/pinned_schools.module';
import { PostMediaModule } from './post_media/post_media.module';
import { PostSharesModule } from './post_shares/post_shares.module';
import { PostCommentsModule } from './post_comments/post_comments.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rend les variables d'env disponibles partout
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
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
    CloudinaryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
