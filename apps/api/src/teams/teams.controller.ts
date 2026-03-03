import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TeamSport } from '@prisma/client';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsService } from './teams.service';
import { normalizeOptionalTeamSportOrThrow } from './team-sport.util';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'sport', required: false, enum: TeamSport })
  @ApiQuery({ name: 'take', required: false, example: 50 })
  @ApiQuery({ name: 'cursor', required: false, example: 10 })
  list(
    @Query('sport') sport?: string,
    @Query('take') take?: string,
    @Query('cursor') cursor?: string,
  ) {
    const takeNum =
      take !== undefined && take !== '' ? Number(take) : undefined;
    if (
      takeNum !== undefined &&
      (!Number.isInteger(takeNum) || takeNum <= 0 || takeNum > 100)
    ) {
      throw new BadRequestException('take must be an integer between 1 and 100');
    }

    const cursorNum =
      cursor !== undefined && cursor !== '' ? Number(cursor) : undefined;
    if (
      cursorNum !== undefined &&
      (!Number.isInteger(cursorNum) || cursorNum <= 0)
    ) {
      throw new BadRequestException('cursor must be a positive integer');
    }

    const normalizedSport = normalizeOptionalTeamSportOrThrow(
      sport,
      'query.sport',
    );

    return this.teamsService.list({
      sport: normalizedSport,
      take: takeNum,
      cursor: cursorNum,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }
}
