import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('posts')
  listPosts() {
    return this.prisma.client.post.findMany({ orderBy: { id: 'desc' } });
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.prisma.client.post.findUnique({ where: { id: Number(id) } });
  }

  @Post('posts')
  createPost(@Body() body: { title: string; content: string }) {
    return this.prisma.client.post.create({
      data: { title: body.title, content: body.content },
    });
  }
}