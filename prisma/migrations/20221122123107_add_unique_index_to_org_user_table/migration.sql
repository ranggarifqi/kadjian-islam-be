/*
  Warnings:

  - A unique constraint covering the columns `[userId,organisationId]` on the table `OrgUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OrgUser_userId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "OrgUser_userId_organisationId_key" ON "OrgUser"("userId", "organisationId");
