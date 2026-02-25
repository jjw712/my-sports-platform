import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchPostsService } from './match-posts.service';
import { CreateMatchPostDto } from './dto/create-match-post.dto';
import { CreateMatchChallengeDto } from './dto/create-match-challenge.dto';
import { parseDateRange } from './dto/parse-date-range.util';

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

  @Get()
  list(
    @Query('region') region?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('date') date?: string,
    @Query('includeClosed') includeClosed?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const takeNum = Math.min(Math.max(Number(take ?? 20), 1), 50);
    if (!Number.isFinite(takeNum)) {
      throw new BadRequestException('take must be a number');
    }

    const cursorNum =
      cursor !== undefined && cursor !== '' ? Number(cursor) : undefined;
    if (
      cursorNum !== undefined &&
      (!Number.isInteger(cursorNum) || cursorNum <= 0)
    ) {
      throw new BadRequestException('cursor must be a positive integer');
    }

    const { rangeStart, rangeEnd } = parseDateRange({
      dateFrom,
      dateTo,
      date,
    });

    let includeClosedBool = false;
    if (includeClosed !== undefined && includeClosed !== '') {
      const normalized = includeClosed.trim().toLowerCase();
      if (normalized === 'true') includeClosedBool = true;
      else if (normalized === 'false') includeClosedBool = false;
      else
        throw new BadRequestException(
          'includeClosed must be a boolean (true/false)',
        );
    }

    return this.matchPostsService.list({
      region,
      take: takeNum,
      cursor: cursorNum,
      includeClosed: includeClosedBool,
      rangeStart,
      rangeEnd,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.matchPostsService.get(this.parseId(id));
  }

  @Post(':id/challenges')
  createChallenge(
    @Param('id') id: string,
    @Body() dto: CreateMatchChallengeDto,
  ) {
    return this.matchPostsService.createChallenge(this.parseId(id), dto);
  }
}
