# Copilot Instructions

## Project Overview
- This repository is a TypeScript monorepo with two apps:
- `apps/web`: Next.js App Router frontend running on port `3001`
- `apps/api`: NestJS backend with Prisma/PostgreSQL running on port `4000`
- The frontend should call Next.js route handlers under `apps/web/app/api/*` as a proxy layer. Do not call the NestJS server directly from client components.

## Architecture Rules
- Keep frontend and backend concerns separated.
- If a new frontend feature needs backend data, add or extend a proxy route in `apps/web/app/api/*` and have it call `API_BASE`.
- Backend business logic belongs in NestJS services, not controllers.
- Prisma access should go through `PrismaService`.
- Reuse existing Zod schemas in `apps/web/src/lib/schemas.ts` for frontend API validation and types.

## Backend Conventions
- Follow existing NestJS module structure: controller, service, dto, spec.
- Use DTO validation with `class-validator` and Swagger decorators where the module already does so.
- Preserve current domain naming:
- teams use `TeamSport`
- match posts, challenges, slots, venues, and matches follow the existing naming in `apps/api/src/*`
- When handling team sports, reuse `apps/api/src/teams/team-sport.util.ts` instead of duplicating normalization logic.
- Prefer returning normalized, API-safe data from services when the rest of the module already expects normalized values.

## Frontend Conventions
- Prefer Server Components by default, and add `"use client"` only when state/effects/browser APIs are required.
- Use existing UI primitives under `apps/web/src/components/ui/*`.
- Validate API responses with Zod via helpers such as `apiGet` and `apiPost`.
- Keep forms and pages consistent with current code style in `apps/web/app/*`.
- Preserve current Korean UX copy where the page already uses Korean text.

## Data Flow
- Team, match, venue, and post types should stay aligned between:
- NestJS response shapes
- Next.js proxy routes
- Zod schemas in `apps/web/src/lib/schemas.ts`
- If you change an API response, update the corresponding Zod schema and affected UI together.

## Practical Guidance
- Before adding new files, check for an existing module, schema, utility, or component to extend.
- Keep changes minimal and localized.
- Add or update tests when backend behavior changes, especially service/controller specs in `apps/api/src/**/*.spec.ts`.
- Do not introduce a second source of truth for validation, enum handling, or API typing when the repo already has one.

## Common Commands
- Frontend dev: `cd apps/web && npm run dev`
- Backend dev: `cd apps/api && npm run start:dev`
- Backend tests: `cd apps/api && npm test`
