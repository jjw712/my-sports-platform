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
  list(@Query('region') region?: string, @Query('query') query?: string) {
    const trimmedQuery = query?.trim();
    return this.venuesService.list(region, trimmedQuery);
  }
}
