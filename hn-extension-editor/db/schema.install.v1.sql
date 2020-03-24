CREATE TABLE "extension_Info" (
  "extensionId" SERIAL PRIMARY KEY,
  "extensionName" text,
  "languageId" int,
  "allowSaves" boolean,
  "description" varchar,
  "startingThemeId" int,
  "startingMusic" int,
  "statingMissionId" int,
  "workshop_description" varchar,
  "workshop_language" text,
  "workshop_visibility" int,
  "workshop_tags" varchar,
  "workshop_img" text,
  "workshop_id" text
);

CREATE TABLE "hn_Music" (
  "musicId" SERIAL PRIMARY KEY,
  "ownerId" int,
  "title" text
);

CREATE TABLE "hn_Theme" (
  "themeId" SERIAL PRIMARY KEY,
  "ownerId" int,
  "meta" varchar
);

CREATE TABLE "hn_Mission" (
  "missionId" SERIAL PRIMARY KEY,
  "extensionId" int,
  "activeCheck" boolean,
  "shouldIgnoreSenderVerification" boolean,
  "missionStart" text,
  "missionEnd" text,
  "nextMission" int,
  "IsSilent" boolean,
  "emailId" int,
  "postingId" int
);

CREATE TABLE "hn_CompNode" (
  "nodeId" SERIAL PRIMARY KEY,
  "extensionId" int,
  "id" text,
  "name" text,
  "ip" text,
  "securityLevel" int,
  "allowsDefaultBootModule" boolean,
  "icon" text,
  "typeId" int,
  "adminPass" text,
  "portsForCrack" int,
  "traceTime" float,
  "adminInfoId" int,
  "tracker" text
);

CREATE TABLE "ln_Starting_Comp" (
  "extensionId" int,
  "nodeId" int
);

CREATE TABLE "hn_CompType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE "hn_CompFile" (
  "fileId" int,
  "extensionId" int,
  "path" text,
  "name" text,
  "contents" varchar
);

CREATE TABLE "ln_Comp_File" (
  "nodeId" int,
  "fileId" int
);

CREATE TABLE "hn_Ports" (
  "portId" SERIAL PRIMARY KEY,
  "port" int,
  "portType" text
);

CREATE TABLE "ln_Comp_Ports" (
  "nodeId" int,
  "portId" int
);

CREATE TABLE "hn_PortRemap" (
  "nodeId" int,
  "portType" text,
  "port" int
);

CREATE TABLE "hn_AdminType" (
  "adminTypeId" SERIAL PRIMARY KEY,
  "adminType" text
);

CREATE TABLE "hn_Admin" (
  "adminId" SERIAL PRIMARY KEY,
  "extensionId" int,
  "nodeId" int,
  "adminTypeId" int,
  "resetPassword" boolean,
  "isSuper" boolean
);

CREATE TABLE "hn_Email" (
  "emailId" SERIAL PRIMARY KEY,
  "sender" text,
  "subject" text,
  "body" varchar
);

CREATE TABLE "ln_attachment_email" (
  "emailId" int,
  "attachmentId" int
);

CREATE TABLE "hn_AttachmentType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE "hn_EmailAttachment" (
  "attachmentId" SERIAL PRIMARY KEY,
  "typeId" int,
  "content" text,
  "comp" text,
  "user" text,
  "pass" text
);

CREATE TABLE "hn_BoardPost" (
  "postingId" SERIAL PRIMARY KEY,
  "title" text,
  "reqs" text,
  "requiredRank" int,
  "content" varchar
);

CREATE TABLE "hn_MissionBranch" (
  "branchId" SERIAL PRIMARY KEY,
  "missionId_1" int,
  "missionId_2" int
);

CREATE TABLE "hn_MGoalType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE "ln_Goal_Mission" (
  "missionId" int,
  "goalId" int
);

CREATE TABLE "hn_MissionGoal" (
  "goalId" SERIAL PRIMARY KEY,
  "typeId" int,
  "file" text,
  "path" text,
  "keyword" text,
  "removal" boolean,
  "caseSensitive" boolean,
  "owner" text,
  "degree" text,
  "uni" text,
  "gpa" text,
  "mailServer" text,
  "recipient" text,
  "subject" text
);

CREATE TABLE "user" (
  "userId" SERIAL PRIMARY KEY,
  "email" text,
  "username" text,
  "password" varchar,
  "salt" text
);

CREATE TABLE "user_Extension" (
  "userId" int,
  "extensionId" int
);

CREATE TABLE "extension_Language" (
  "langId" SERIAL PRIMARY KEY,
  "lang" text,
  "Language" text
);

ALTER TABLE "user_Extension" ADD FOREIGN KEY ("userId") REFERENCES "user" ("userId");

ALTER TABLE "user_Extension" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "extension_Language" ADD FOREIGN KEY ("langId") REFERENCES "extension_Info" ("languageId");

ALTER TABLE "hn_Theme" ADD FOREIGN KEY ("themeId") REFERENCES "extension_Info" ("startingThemeId");

ALTER TABLE "hn_Music" ADD FOREIGN KEY ("musicId") REFERENCES "extension_Info" ("startingMusic");

ALTER TABLE "hn_MGoalType" ADD FOREIGN KEY ("typeId") REFERENCES "hn_MissionGoal" ("typeId");

ALTER TABLE "ln_Goal_Mission" ADD FOREIGN KEY ("missionId") REFERENCES "hn_Mission" ("missionId");

ALTER TABLE "ln_Goal_Mission" ADD FOREIGN KEY ("goalId") REFERENCES "hn_MissionGoal" ("goalId");

ALTER TABLE "hn_Mission" ADD FOREIGN KEY ("nextMission") REFERENCES "hn_Mission" ("missionId");

ALTER TABLE "hn_MissionBranch" ADD FOREIGN KEY ("missionId_1") REFERENCES "hn_Mission" ("missionId");

ALTER TABLE "hn_MissionBranch" ADD FOREIGN KEY ("missionId_2") REFERENCES "hn_Mission" ("missionId");

ALTER TABLE "ln_attachment_email" ADD FOREIGN KEY ("emailId") REFERENCES "hn_Email" ("emailId");

ALTER TABLE "hn_EmailAttachment" ADD FOREIGN KEY ("attachmentId") REFERENCES "ln_attachment_email" ("attachmentId");

ALTER TABLE "hn_Email" ADD FOREIGN KEY ("emailId") REFERENCES "hn_Mission" ("emailId");

ALTER TABLE "hn_BoardPost" ADD FOREIGN KEY ("postingId") REFERENCES "hn_Mission" ("postingId");

ALTER TABLE "hn_Mission" ADD FOREIGN KEY ("missionId") REFERENCES "extension_Info" ("statingMissionId");

ALTER TABLE "hn_AttachmentType" ADD FOREIGN KEY ("typeId") REFERENCES "hn_EmailAttachment" ("typeId");

ALTER TABLE "ln_Comp_File" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");

ALTER TABLE "hn_CompFile" ADD FOREIGN KEY ("fileId") REFERENCES "ln_Comp_File" ("fileId");

ALTER TABLE "ln_Comp_Ports" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");

ALTER TABLE "hn_Ports" ADD FOREIGN KEY ("portId") REFERENCES "ln_Comp_Ports" ("portId");

ALTER TABLE "hn_PortRemap" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");

ALTER TABLE "hn_Ports" ADD FOREIGN KEY ("portType") REFERENCES "hn_PortRemap" ("portType");

ALTER TABLE "hn_CompNode" ADD FOREIGN KEY ("typeId") REFERENCES "hn_CompType" ("typeId");

ALTER TABLE "hn_CompNode" ADD FOREIGN KEY ("nodeId") REFERENCES "ln_Starting_Comp" ("nodeId");

ALTER TABLE "extension_Info" ADD FOREIGN KEY ("extensionId") REFERENCES "ln_Starting_Comp" ("extensionId");

ALTER TABLE "hn_AdminType" ADD FOREIGN KEY ("adminTypeId") REFERENCES "hn_Admin" ("adminTypeId");

ALTER TABLE "hn_CompNode" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_Admin" ("nodeId");

ALTER TABLE "hn_Admin" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "extension_Info" ADD FOREIGN KEY ("extensionId") REFERENCES "hn_Mission" ("extensionId");

ALTER TABLE "extension_Info" ADD FOREIGN KEY ("extensionId") REFERENCES "hn_CompFile" ("extensionId");
