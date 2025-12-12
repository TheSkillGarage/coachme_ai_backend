/*
  Warnings:

  - Added the required column `company` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('NORMAL', 'HIGH');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'INTERVIEW_SCHEDULED';

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "applicationId" TEXT,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notifications_userId_type_idx" ON "notifications"("userId", "type");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
