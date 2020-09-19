ALTER TABLE "hn_CompNode"
	ADD COLUMN "fwall_Level" int DEFAULT -1,
	ADD COLUMN "fwall_solution" text,
	ADD COLUMN "fwall_additional" float,
	ADD COLUMN "proxyTime" int DEFAULT -1;

CREATE TABLE IF NOT EXISTS "Variables" (
	"VariableName" text,
	"VariableValue" text
);

CREATE TABLE "hn_FileTemplate" (
	"templateId" SERIAL PRIMARY KEY,
	"path" text,
	"name" text,
	"contents" varchar
);

INSERT INTO "Variables" VALUES ('db.schema-version', '1.0.1');