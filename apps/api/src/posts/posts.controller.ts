import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ToggleReactionDto } from './dto/toggle-like.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/auth.types';

interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

@ApiTags('posts')
@Controller('posts') // main.ts에서 /api prefix 있으니 /api/posts
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private parseId(id: string): number {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) {
      throw new BadRequestException('id must be a positive integer');
    }
    return n;
  }

  @Get()
  async list(@Query('take') take?: string, @Query('cursor') cursor?: string) {
    const takeNum = Math.min(Math.max(Number(take ?? 20), 1), 50);

    const cursorNum =
      cursor !== undefined && cursor !== '' ? Number(cursor) : undefined;
    if (
      cursorNum !== undefined &&
      (!Number.isInteger(cursorNum) || cursorNum <= 0)
    ) {
      throw new BadRequestException('cursor must be a positive integer');
    }

    const items = await this.postsService.list(takeNum, cursorNum);
    const nextCursor = items.length ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.postsService.get(this.parseId(id));
  }

  @UseGuards(JwtAuthGuard) // 게스트/유저 전부 토큰 필요
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePostDto) {
    return this.postsService.create(dto, req.user);
  }

  @Post(':id/reaction')
  toggleReaction(@Param('id') id: string, @Body() dto: ToggleReactionDto) {
    return this.postsService.toggleReaction(this.parseId(id), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ) {
    if (body.title === undefined && body.content === undefined) {
      throw new BadRequestException(
        'at least one of title/content is required',
      );
    }
    return this.postsService.update(this.parseId(id), body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.postsService.remove(this.parseId(id), req.user);
  }
}
