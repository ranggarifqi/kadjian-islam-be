-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifyToken" TEXT;
