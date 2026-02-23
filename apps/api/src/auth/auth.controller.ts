// src/auth/auth.controller.ts
import { Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Post('guest')
  guest() {
    const sub = `guest_${Date.now()}`;
    const role: UserRole = 'GUEST';

    const accessToken = this.jwt.sign({ sub, role });

    return {
      user: { id: sub, role },
      accessToken,
    };
  }
}
