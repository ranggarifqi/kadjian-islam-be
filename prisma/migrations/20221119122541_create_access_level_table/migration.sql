-- CreateTable
CREATE TABLE "AccessLevel" (
    "name" TEXT NOT NULL,

    CONSTRAINT "AccessLevel_pkey" PRIMARY KEY ("name")
);

INSERT INTO "AccessLevel" 
VALUES 
    ('User'), 
    ('Admin'), 
    ('Moderator')
;
