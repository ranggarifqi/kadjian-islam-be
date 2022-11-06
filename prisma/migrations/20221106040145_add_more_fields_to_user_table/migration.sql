-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('IKHWAN', 'AKHWAT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "gender" "Gender" DEFAULT 'IKHWAN',
ADD COLUMN     "provinceId" TEXT;

-- CreateIndex
CREATE INDEX "User_provinceId_idx" ON "User"("provinceId");

-- CreateIndex
CREATE INDEX "User_districtId_idx" ON "User"("districtId");

-- CreateIndex
CREATE INDEX "User_credentialId_idx" ON "User"("credentialId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;
