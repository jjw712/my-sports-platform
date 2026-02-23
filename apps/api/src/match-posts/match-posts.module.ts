import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchPostsController } from './match-posts.controller';
import { MatchPostsService } from './match-posts.service';

@Module({
  imports: [PrismaModule],
  controllers: [MatchPostsController],
  providers: [MatchPostsService],
})
export class MatchPostsModule {}
