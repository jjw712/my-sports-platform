/*
  Warnings:

  - The primary key for the `Venue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Venue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueKey]` on the table `Venue` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[source,sourceId]` on the table `Venue` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_venueId_fkey";

-- DropForeignKey
ALTER TABLE "MatchPost" DROP CONSTRAINT "MatchPost_venueId_fkey";

-- DropIndex
DROP INDEX "Venue_region_idx";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "venueId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "MatchPost" ALTER COLUMN "venueId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Venue" DROP CONSTRAINT "Venue_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "region",
ADD COLUMN     "facilityType" TEXT,
ADD COLUMN     "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sido" TEXT,
ADD COLUMN     "sigungu" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sports" TEXT[],
ADD COLUMN     "uniqueKey" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "lat" DROP NOT NULL,
ALTER COLUMN "lng" DROP NOT NULL,
ADD CONSTRAINT "Venue_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Venue_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Venue_uniqueKey_key" ON "Venue"("uniqueKey");

-- CreateIndex
CREATE INDEX "Venue_sido_sigungu_idx" ON "Venue"("sido", "sigungu");

-- CreateIndex
CREATE INDEX "Venue_lat_lng_idx" ON "Venue"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_source_sourceId_key" ON "Venue"("source", "sourceId");

-- AddForeignKey
ALTER TABLE "MatchPost" ADD CONSTRAINT "MatchPost_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
