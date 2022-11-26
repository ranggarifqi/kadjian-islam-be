-- CreateTable
CREATE TABLE "ClassRoom" (
    "id" UUID NOT NULL,
    "organisationId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "timeStart" TIMESTAMPTZ NOT NULL,
    "timeEnd" TIMESTAMPTZ NOT NULL,
    "speakerName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "provinceId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "updatedBy" UUID NOT NULL,

    CONSTRAINT "ClassRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassRoom_organisationId_idx" ON "ClassRoom"("organisationId");

-- CreateIndex
CREATE INDEX "ClassRoom_provinceId_idx" ON "ClassRoom"("provinceId");

-- CreateIndex
CREATE INDEX "ClassRoom_districtId_idx" ON "ClassRoom"("districtId");

-- AddForeignKey
ALTER TABLE "ClassRoom" ADD CONSTRAINT "ClassRoom_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRoom" ADD CONSTRAINT "ClassRoom_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassRoom" ADD CONSTRAINT "ClassRoom_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
