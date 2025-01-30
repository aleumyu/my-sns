/*
  Warnings:

  - A unique constraint covering the columns `[followerId,followeeId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followeeId_key" ON "Follow"("followerId", "followeeId");
