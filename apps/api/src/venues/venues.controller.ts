import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';

@ApiTags('venues')
@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  create(@Body() dto: CreateVenueDto) {
    return this.venuesService.create(dto);
  }

  @Get('regions')
  listRegions() {
    return this.venuesService.listRegions();
  }

  @Get()
  list(
    @Query('bbox') bbox?: string,
    @Query('sport') sport?: string,
    @Query('query') query?: string,
  ) {
    const trimmedQuery = query?.trim();
    const parsedBbox = parseBbox(bbox);
    return this.venuesService.list({
      bbox: parsedBbox ?? undefined,
      sport: sport?.trim() || undefined,
      query: trimmedQuery,
    });
  }
}

function parseBbox(value?: string): [number, number, number, number] | null {
  if (!value) return null;
  const parts = value.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 4) return null;
  if (parts.some((part) => Number.isNaN(part))) return null;
  return [parts[0], parts[1], parts[2], parts[3]];
}
