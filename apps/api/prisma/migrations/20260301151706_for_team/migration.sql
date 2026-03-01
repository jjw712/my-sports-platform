/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TeamSport" AS ENUM ('SOCCER', 'BASKETBALL', 'BASEBALL');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "description" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "sport" "TeamSport" NOT NULL DEFAULT 'SOCCER',
ALTER COLUMN "region" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
