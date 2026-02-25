import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async listRegions() {
    const rows = await this.prisma.client.venue.findMany({
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    });

    return rows.map((r) => r.region);
  }

  list(region?: string, query?: string) {
    const keyword = query?.trim();
    const search: Prisma.VenueWhereInput | undefined =
      keyword && keyword.length > 0
        ? {
            OR: [
              { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
              {
                address: { contains: keyword, mode: Prisma.QueryMode.insensitive },
              },
            ],
          }
        : undefined;

    return this.prisma.client.venue.findMany({
      where: {
        ...(region ? { region } : {}),
        ...(search ?? {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
