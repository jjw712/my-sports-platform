# My Platform

Full-stack practice project built with **Next.js (App Router)** and **NestJS**,  
focusing on clean architecture, type safety, and frontend–backend integration.

프론트엔드와 백엔드를 분리하고,  
Next.js API Route를 **프록시 레이어**로 사용해 구조를 단순화한 프로젝트입니다.

---

## Tech Stack
- Frontend: Next.js 16 (App Router)
- Backend: NestJS
- Database: PostgreSQL (Prisma ORM)
- Language: TypeScript
- Validation: Zod
- Dev / Share: ngrok

---

## Project Structure

apps/
web/ # Next.js frontend (App Router)
api/ # NestJS backend

yaml
코드 복사

---

## Architecture

Client (Browser)
↓
Next.js (apps/web)
↓ /api/posts (proxy)
NestJS API (apps/api)

yaml
코드 복사

- 클라이언트는 **항상 Next.js만 접근**
- 실제 API 요청은 Next API Route가 NestJS로 전달
- CORS 없이 frontend–backend 통합
- 로컬/외부 공유 환경 전환 시 코드 수정 불필요

---

## Features (Current)
- Posts CRUD API (NestJS)
- Cursor-based pagination
- Frontend ↔ Backend integration
- Type-safe API layer with Zod
- Load-more pagination UI
- Prisma CI configuration fixed
- Next.js API proxy layer

---

## Running Locally

### Backend
```bash
cd apps/api
npm install
npm run start:dev
Runs on:

arduino
코드 복사
http://localhost:4000
Frontend
bash
코드 복사
cd apps/web
npm install
npm run dev
Runs on:

arduino
코드 복사
http://localhost:3001
Environment Variables
Frontend (apps/web/.env.local)
env
코드 복사
API_BASE=http://localhost:4000
API_BASE는 항상 백엔드 주소

ngrok 사용 여부와 무관

ngrok URL을 여기에 넣지 않음

Backend (apps/api/.env)
env
코드 복사
DATABASE_URL=your_database_url
Using ngrok (External Access)
외부 공유가 필요할 때만 ngrok 사용.

bash
코드 복사
ngrok http 3001
Next.js 서버만 외부에 공개

NestJS API는 로컬에서만 동작

환경변수 / 코드 수정 불필요

하나의 ngrok 링크로 여러 명 접속 가능 (Free 플랜은 트래픽 제한 있음)

접속:

cpp
코드 복사
https://<your-ngrok-subdomain>.ngrok-free.dev