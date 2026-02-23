import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ToggleReactionDto } from "./dto/toggle-like.dto";
import { AuthUser } from '../auth/auth.types';


@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(take: number, cursor?: number) {
  const posts = await this.prisma.client.post.findMany({
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { id: "desc" },
    select: {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    authorKey: true,
    authorRole: true,
  },
});
  const ids = posts.map(p => p.id);
  if (ids.length === 0) return posts.map(p => ({ ...p, likeCount: 0, dislikeCount: 0 }));

  const grouped = await this.prisma.client.postReaction.groupBy({
    by: ["postId", "type"],
    where: { postId: { in: ids } },
    _count: { _all: true },
  });

  const map = new Map<string, number>();
  for (const g of grouped) map.set(`${g.postId}:${g.type}`, g._count._all);

  return posts.map(p => ({
    ...p,
    likeCount: map.get(`${p.id}:LIKE`) ?? 0,
    dislikeCount: map.get(`${p.id}:DISLIKE`) ?? 0,
  }));
}


  async get(id: number) {
    const post = await this.prisma.client.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('post not found');
    return post;
  }

  create(
  dto: CreatePostDto,
  user: AuthUser,
) {
  return this.prisma.client.post.create({
    data: {
      title: dto.title,
      content: dto.content,
      authorKey: user.id,
      authorRole: user.role,
    },
  });
}

  async update(
  id: number,
  dto: UpdatePostDto,
  user: AuthUser
) {
  const post = await this.prisma.client.post.findUnique({ where: { id } });
  if (!post) throw new NotFoundException('post not found');

  if (post.authorKey !== user.id) {
    throw new ForbiddenException('본인 글만 수정 가능');
  }

  return this.prisma.client.post.update({
    where: { id },
    data: {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.content !== undefined ? { content: dto.content } : {}),
    },
  });
}

  async remove(id: number, user: AuthUser) {
  const post = await this.prisma.client.post.findUnique({ where: { id } });
  if (!post) throw new NotFoundException('post not found');

  if (post.authorKey !== user.id) {
    throw new ForbiddenException('본인 글만 삭제 가능');
  }

  await this.prisma.client.post.delete({ where: { id } });
  return { ok: true };
}


  

   async toggleReaction(postId: number, dto: { userId: string; type: "LIKE" | "DISLIKE" }) {
  const { userId, type } = dto;

  // post 존재 확인(선택)
  await this.prisma.client.post.findUniqueOrThrow({ where: { id: postId } });

  const existing = await this.prisma.client.postReaction.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  let myReaction: "LIKE" | "DISLIKE" | "NONE" = "NONE";

  if (!existing) {
    await this.prisma.client.postReaction.create({
      data: { postId, userId, type },
    });
    myReaction = type;
  } else if (existing.type === type) {
    await this.prisma.client.postReaction.delete({
      where: { postId_userId: { postId, userId } },
    });
    myReaction = "NONE";
  } else {
    await this.prisma.client.postReaction.update({
      where: { postId_userId: { postId, userId } },
      data: { type },
    });
    myReaction = type;
  }

  // 집계(다른 이용자 포함)
  const [likeCount, dislikeCount] = await Promise.all([
    this.prisma.client.postReaction.count({ where: { postId, type: "LIKE" } }),
    this.prisma.client.postReaction.count({ where: { postId, type: "DISLIKE" } }),
  ]);

  return { myReaction, likeCount, dislikeCount };
}


}
