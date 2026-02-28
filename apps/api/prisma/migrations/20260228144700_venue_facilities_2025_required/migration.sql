/*
  Warnings:

  - Made the column `sido` on table `Venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `source` on table `Venue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uniqueKey` on table `Venue` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Venue" ALTER COLUMN "sido" SET NOT NULL,
ALTER COLUMN "source" SET NOT NULL,
ALTER COLUMN "uniqueKey" SET NOT NULL;
