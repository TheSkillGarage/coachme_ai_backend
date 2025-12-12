/*
  Warnings:

  - You are about to drop the column `company` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "company",
DROP COLUMN "location",
DROP COLUMN "position",
ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "interviewLocation" TEXT,
ADD COLUMN     "interviewType" TEXT;
