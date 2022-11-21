-- CreateTable
CREATE TABLE "OrgUserRole" (
    "name" TEXT NOT NULL,

    CONSTRAINT "OrgUserRole_pkey" PRIMARY KEY ("name")
);

INSERT INTO "OrgUserRole" 
VALUES
    ('Admin'),
    ('Member')
;

-- CreateTable
CREATE TABLE "OrgUser" (
    "id" UUID NOT NULL,
    "userid" UUID NOT NULL,
    "organisationId" UUID NOT NULL,
    "orgUserRole" TEXT NOT NULL DEFAULT 'Admin',
    "isSelected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrgUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrgUser" ADD CONSTRAINT "OrgUser_orgUserRole_fkey" FOREIGN KEY ("orgUserRole") REFERENCES "OrgUserRole"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
