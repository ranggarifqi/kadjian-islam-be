/*
  Warnings:

  - A unique constraint covering the columns `[credentialId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credentialId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credentialId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_credentialId_key" ON "User"("credentialId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
