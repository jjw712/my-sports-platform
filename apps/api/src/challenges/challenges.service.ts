import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  async accept(challengeId: number) {
    return this.prisma.client.$transaction(async (tx) => {
      const challenge = await tx.matchChallenge.findUnique({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException('challenge not found');
      }

      if (challenge.status !== 'PENDING') {
        throw new ConflictException('challenge is not pending');
      }

      const slot = await tx.timeSlot.findUnique({
        where: { id: challenge.slotId },
      });

      if (!slot) {
        throw new NotFoundException('slot not found');
      }

      if (slot.status !== 'OPEN') {
        throw new ConflictException('slot is not open');
      }

      const post = await tx.matchPost.findUnique({
        where: { id: challenge.matchPostId },
      });

      if (!post) {
        throw new NotFoundException('match post not found');
      }

      const overlapCount = await tx.match.count({
        where: {
          status: 'SCHEDULED',
          startAt: { lt: slot.endAt },
          endAt: { gt: slot.startAt },
          OR: [
            { hostTeamId: post.hostTeamId },
            { awayTeamId: post.hostTeamId },
            { hostTeamId: challenge.challengerTeamId },
            { awayTeamId: challenge.challengerTeamId },
          ],
        },
      });

      if (overlapCount > 0) {
        throw new ConflictException('team has overlapping match');
      }

      await tx.timeSlot.update({
        where: { id: slot.id },
        data: { status: 'LOCKED' },
      });

      await tx.matchChallenge.update({
        where: { id: challenge.id },
        data: { status: 'ACCEPTED' },
      });

      const match = await tx.match.create({
        data: {
          hostTeamId: post.hostTeamId,
          awayTeamId: challenge.challengerTeamId,
          venueId: post.venueId,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: 'SCHEDULED',
          matchPostId: post.id,
        },
      });

      await tx.matchPost.update({
        where: { id: post.id },
        data: { status: 'CLOSED' },
      });

      await tx.matchChallenge.updateMany({
        where: {
          matchPostId: post.id,
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      return {
        match,
        post: {
          id: post.id,
          status: 'CLOSED',
        },
        slot: {
          id: slot.id,
          status: 'LOCKED',
          startAt: slot.startAt,
          endAt: slot.endAt,
        },
        challenge: {
          id: challenge.id,
          status: 'ACCEPTED',
          matchPostId: challenge.matchPostId,
          slotId: challenge.slotId,
          challengerTeamId: challenge.challengerTeamId,
        },
      };
    });
  }
}
