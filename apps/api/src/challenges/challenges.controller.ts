import { BadRequestException, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';

@ApiTags('challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  private parseId(id: string): number {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) {
      throw new BadRequestException('id must be a positive integer');
    }
    return n;
  }

  @Post(':id/accept')
  accept(@Param('id') id: string) {
    // TODO: host만 accept 가능
    return this.challengesService.accept(this.parseId(id));
  }
}
