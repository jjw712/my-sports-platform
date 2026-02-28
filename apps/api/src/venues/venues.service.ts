import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { makeUniqueKey, normalizeAddress, normalizeName } from '../ingest/venues/normalize';
import { kakaoGeocode } from '../lib/kakaoGeocode';

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto) {
    const name = normalizeName(dto.name);
    const address = dto.address ? normalizeAddress(dto.address) : undefined;
    const uniqueKey = makeUniqueKey(dto.sido, dto.sigungu, name, address);
    let lat = dto.lat;
    let lng = dto.lng;

    if (address && (lat === undefined || lng === undefined)) {
      const geocoded = await kakaoGeocode(address);
      if (geocoded) {
        lat = geocoded.lat;
        lng = geocoded.lng;
      }
    }

    return this.prisma.client.venue.create({
      data: {
        name,
        sido: dto.sido,
        sigungu: dto.sigungu,
        address,
        lat,
        lng,
        sports: dto.sports && dto.sports.length > 0 ? dto.sports : ['SOCCER'],
        facilityType: dto.sports?.includes('SOCCER') ? 'SOCCER_FIELD' : undefined,
        source: 'MANUAL',
        uniqueKey,
      },
    });
  }

  async listRegions() {
    const rows = await this.prisma.client.venue.findMany({
      select: { sido: true },
      distinct: ['sido'],
      orderBy: { sido: 'asc' },
    });

    return rows.map((r) => r.sido);
  }

  list(options: { bbox?: [number, number, number, number]; sport?: string; query?: string }) {
    const { bbox, sport, query } = options;
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
        ...(sport ? { sports: { has: sport } } : {}),
        ...(bbox
          ? {
              lat: { gte: bbox[1], lte: bbox[3] },
              lng: { gte: bbox[0], lte: bbox[2] },
            }
          : {}),
        ...(search ?? {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
