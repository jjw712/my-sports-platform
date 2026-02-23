import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVenueDto) {
    return this.prisma.client.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        region: dto.region,
        lat: dto.lat,
        lng: dto.lng,
      },
    });
  }

  list(region?: string) {
    return this.prisma.client.venue.findMany({
      where: region ? { region } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
