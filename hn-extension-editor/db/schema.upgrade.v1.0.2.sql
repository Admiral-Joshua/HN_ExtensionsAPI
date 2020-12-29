INSERT INTO "hn_Function" VALUES (0, "NONE", "NONE");

ALTER TABLE "hn_Mission"
DROP COLUMN "missionStart",
DROP COLUMN "missionEnd",
ADD COLUMN "missionStart_ID" INT NOT NULL DEFAULT 0,
ADD COLUMN "missionStart_Meta" TEXT NULL,
ADD COLUMN "missionStart_val" INT NOT NULL DEFAULT 0,
ADD COLUMN "missionStart_suppress" BOOLEAN NOT NULL DEFAULT FALSE,

ADD COLUMN "missionEnd_ID" INT NOT NULL DEFAULT 0,
ADD COLUMN "missionEnd_Meta" TEXT NULL,
ADD COLUMN "missionEnd_val" INT NOT NULL DEFAULT 0,
ADD COLUMN "missionEnd_suppress" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "hn_Mission"
ADD FOREIGN KEY ("missionStart_ID") REFERENCES "hn_Function" ("functionId");

ALTER TABLE "hn_Mission"
ADD FOREIGN KEY ("missionEnd_ID") REFERENCES "hn_Function" ("functionId");


UPDATE "Variables" SET "VariableValue" = '1.0.2' WHERE "VariableName" = 'db.schema-version';