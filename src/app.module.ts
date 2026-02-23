import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { config } from 'process';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
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
