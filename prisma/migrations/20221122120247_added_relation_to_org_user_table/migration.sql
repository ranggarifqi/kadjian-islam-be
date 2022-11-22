/*
  Warnings:

  - You are about to drop the column `userid` on the `OrgUser` table. All the data in the column will be lost.
  - Added the required column `userId` to the `OrgUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrgUser" DROP COLUMN "userid", -- it's fine. Cos at this point we don't have data yet
ADD COLUMN     "userId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "OrgUser" ADD CONSTRAINT "OrgUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgUser" ADD CONSTRAINT "OrgUser_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
