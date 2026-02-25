import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';

const VALID_STATUSES = new Set(['SCHEDULED', 'COMPLETED', 'CANCELLED']);

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  list(
    @Query('teamId') teamId?: string,
    @Query('status') status?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const takeNum = Math.min(Math.max(Number(take ?? 20), 1), 50);
    if (!Number.isFinite(takeNum)) {
      throw new BadRequestException('take must be a number');
    }

    const teamIdNum =
      teamId !== undefined && teamId !== '' ? Number(teamId) : undefined;
    if (
      teamIdNum !== undefined &&
      (!Number.isInteger(teamIdNum) || teamIdNum <= 0)
    ) {
      throw new BadRequestException('teamId must be a positive integer');
    }

    const cursorNum =
      cursor !== undefined && cursor !== '' ? Number(cursor) : undefined;
    if (
      cursorNum !== undefined &&
      (!Number.isInteger(cursorNum) || cursorNum <= 0)
    ) {
      throw new BadRequestException('cursor must be a positive integer');
    }

    const normalizedStatus = (status ?? 'SCHEDULED').toUpperCase();
    if (!VALID_STATUSES.has(normalizedStatus)) {
      throw new BadRequestException(
        'status must be one of SCHEDULED, COMPLETED, CANCELLED',
      );
    }

    return this.matchesService.list({
      teamId: teamIdNum,
      status: normalizedStatus as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED',
      take: takeNum,
      cursor: cursorNum,
    });
  }
}
