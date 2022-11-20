-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "accessLevel" TEXT NOT NULL DEFAULT 'User';

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_accessLevel_fkey" FOREIGN KEY ("accessLevel") REFERENCES "AccessLevel"("name") ON DELETE RESTRICT ON UPDATE CASCADE;


