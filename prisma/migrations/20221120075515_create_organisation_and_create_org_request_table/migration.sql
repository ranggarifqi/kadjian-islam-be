-- CreateEnum
CREATE TYPE "CreateOrganisationStatus" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- CreateTable
CREATE TABLE "CreateOrganisationRequest" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" VARCHAR(255),
    "mobileNumber" VARCHAR(50) NOT NULL,
    "countryCode" VARCHAR(10) NOT NULL,
    "provinceId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "logo" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "status" "CreateOrganisationStatus" NOT NULL DEFAULT 'PENDING',
    "handledAt" TIMESTAMPTZ,
    "handledBy" UUID,
    "rejectionReason" TEXT,

    CONSTRAINT "CreateOrganisationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" VARCHAR(255),
    "mobileNumber" VARCHAR(50) NOT NULL,
    "countryCode" VARCHAR(10) NOT NULL,
    "provinceId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "logo" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "updatedBy" UUID,
    "requestId" UUID,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreateOrganisationRequest_provinceId_idx" ON "CreateOrganisationRequest"("provinceId");

-- CreateIndex
CREATE INDEX "CreateOrganisationRequest_districtId_idx" ON "CreateOrganisationRequest"("districtId");

-- CreateIndex
CREATE INDEX "CreateOrganisationRequest_createdBy_idx" ON "CreateOrganisationRequest"("createdBy");

-- CreateIndex
CREATE INDEX "CreateOrganisationRequest_handledBy_idx" ON "CreateOrganisationRequest"("handledBy");

-- CreateIndex
CREATE INDEX "Organisation_provinceId_idx" ON "Organisation"("provinceId");

-- CreateIndex
CREATE INDEX "Organisation_districtId_idx" ON "Organisation"("districtId");

-- CreateIndex
CREATE INDEX "Organisation_createdBy_idx" ON "Organisation"("createdBy");

-- CreateIndex
CREATE INDEX "Organisation_updatedBy_idx" ON "Organisation"("updatedBy");

-- AddForeignKey
ALTER TABLE "CreateOrganisationRequest" ADD CONSTRAINT "CreateOrganisationRequest_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateOrganisationRequest" ADD CONSTRAINT "CreateOrganisationRequest_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateOrganisationRequest" ADD CONSTRAINT "CreateOrganisationRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateOrganisationRequest" ADD CONSTRAINT "CreateOrganisationRequest_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
