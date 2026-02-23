import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VenuesModule } from './venues/venues.module';
import { MatchPostsModule } from './match-posts/match-posts.module';
import { ChallengesModule } from './challenges/challenges.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    PostsModule,
    VenuesModule,
    MatchPostsModule,
    ChallengesModule,
  ],
})
export class AppModule {}
