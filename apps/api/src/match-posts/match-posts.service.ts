import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMatchPostDto } from './dto/create-match-post.dto';
import { CreateMatchChallengeDto } from './dto/create-match-challenge.dto';

@Injectable()
export class MatchPostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMatchPostDto) {
    const slots = dto.slots.map((slot, index) => {
      const startAt = new Date(slot.startAt);
      const endAt = new Date(slot.endAt);

      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        throw new BadRequestException(`slots[${index}] has invalid date`);
      }
      if (startAt >= endAt) {
        throw new BadRequestException(`slots[${index}] startAt must be before endAt`);
      }

      return { startAt, endAt };
    });

    return this.prisma.client.matchPost.create({
      data: {
        hostTeamId: dto.hostTeamId,
        venueId: dto.venueId,
        title: dto.title,
        description: dto.description,
        slots: { create: slots },
      },
      include: {
        hostTeam: true,
        venue: true,
        slots: true,
      },
    });
  }

  async createChallenge(matchPostId: number, dto: CreateMatchChallengeDto) {
    const slot = await this.prisma.client.timeSlot.findFirst({
      where: { id: dto.slotId, matchPostId },
    });

    if (!slot) {
      throw new BadRequestException('slot does not belong to match post');
    }

    if (slot.status !== 'OPEN') {
      throw new BadRequestException('slot is not open');
    }

    const existing = await this.prisma.client.matchChallenge.findFirst({
      where: {
        matchPostId,
        challengerTeamId: dto.challengerTeamId,
        status: 'PENDING',
      },
    });

    if (existing) {
      throw new ConflictException('pending challenge already exists');
    }

    return this.prisma.client.matchChallenge.create({
      data: {
        matchPostId,
        slotId: dto.slotId,
        challengerTeamId: dto.challengerTeamId,
        message: dto.message ?? '',
      },
      select: {
        id: true,
        matchPostId: true,
        slotId: true,
        challengerTeamId: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
