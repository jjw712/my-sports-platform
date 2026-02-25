import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTeamDto) {
    return this.prisma.client.team.create({
      data: {
        name: dto.name,
        region: dto.region,
        skillRating: dto.skillRating ?? 0,
      },
    });
  }

  list(region?: string) {
    return this.prisma.client.team.findMany({
      where: region ? { region } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
