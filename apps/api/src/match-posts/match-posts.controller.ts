import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchPostsService } from './match-posts.service';
import { CreateMatchPostDto } from './dto/create-match-post.dto';
import { CreateMatchChallengeDto } from './dto/create-match-challenge.dto';

@ApiTags('match-posts')
@Controller('match-posts')
export class MatchPostsController {
  constructor(private readonly matchPostsService: MatchPostsService) {}

  private parseId(id: string): number {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) {
      throw new BadRequestException('id must be a positive integer');
    }
    return n;
  }

  @Post()
  create(@Body() dto: CreateMatchPostDto) {
    return this.matchPostsService.create(dto);
  }

  @Post(':id/challenges')
  createChallenge(@Param('id') id: string, @Body() dto: CreateMatchChallengeDto) {
    return this.matchPostsService.createChallenge(this.parseId(id), dto);
  }
}
