import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PostsModule } from './posts/posts.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { VenuesModule } from './venues/venues.module';
import { MatchPostsModule } from './match-posts/match-posts.module';
import { ChallengesModule } from './challenges/challenges.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';

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
    TeamsModule,
    MatchPostsModule,
    ChallengesModule,
    MatchesModule,
  ],
})
export class AppModule {}
