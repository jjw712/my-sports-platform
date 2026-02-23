-- CreateEnum
CREATE TYPE "MatchPostStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TimeSlotStatus" AS ENUM ('OPEN', 'LOCKED');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorKey" TEXT NOT NULL DEFAULT 'guest_bootstrap',
ADD COLUMN     "authorRole" "Role" NOT NULL DEFAULT 'GUEST',
ADD COLUMN     "dislikeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "skillRating" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPost" (
    "id" SERIAL NOT NULL,
    "hostTeamId" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MatchPostStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" SERIAL NOT NULL,
    "matchPostId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "TimeSlotStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchChallenge" (
    "id" SERIAL NOT NULL,
    "matchPostId" INTEGER NOT NULL,
    "slotId" INTEGER NOT NULL,
    "challengerTeamId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "hostTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "matchPostId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Venue_region_idx" ON "Venue"("region");

-- CreateIndex
CREATE INDEX "Team_region_idx" ON "Team"("region");

-- CreateIndex
CREATE INDEX "TimeSlot_matchPostId_startAt_idx" ON "TimeSlot"("matchPostId", "startAt");

-- CreateIndex
CREATE INDEX "MatchChallenge_slotId_idx" ON "MatchChallenge"("slotId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchChallenge_matchPostId_challengerTeamId_key" ON "MatchChallenge"("matchPostId", "challengerTeamId");

-- CreateIndex
CREATE INDEX "Match_hostTeamId_startAt_idx" ON "Match"("hostTeamId", "startAt");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_startAt_idx" ON "Match"("awayTeamId", "startAt");

-- AddForeignKey
ALTER TABLE "MatchPost" ADD CONSTRAINT "MatchPost_hostTeamId_fkey" FOREIGN KEY ("hostTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPost" ADD CONSTRAINT "MatchPost_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_matchPostId_fkey" FOREIGN KEY ("matchPostId") REFERENCES "MatchPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchChallenge" ADD CONSTRAINT "MatchChallenge_matchPostId_fkey" FOREIGN KEY ("matchPostId") REFERENCES "MatchPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchChallenge" ADD CONSTRAINT "MatchChallenge_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchChallenge" ADD CONSTRAINT "MatchChallenge_challengerTeamId_fkey" FOREIGN KEY ("challengerTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_hostTeamId_fkey" FOREIGN KEY ("hostTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_matchPostId_fkey" FOREIGN KEY ("matchPostId") REFERENCES "MatchPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;
