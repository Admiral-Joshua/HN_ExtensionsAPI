CREATE TABLE "Extension_Info" (
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

CREATE TABLE "HN_Music" (
  "musicId" SERIAL PRIMARY KEY,
  "ownerId" int,
  "title" text
);

CREATE TABLE "HN_Theme" (
  "themeId" SERIAL PRIMARY KEY,
  "ownerId" int,
  "meta" varchar
);

CREATE TABLE "HN_Mission" (
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

CREATE TABLE "HN_CompNode" (
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

CREATE TABLE "LN_Starting_Comp" (
  "extensionId" int,
  "nodeId" int
);

CREATE TABLE "HN_CompType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE "HN_CompFile" (
  "fileId" int,
  "extensionId" int,
  "path" text,
  "name" text,
  "contents" varchar
);

CREATE TABLE "LN_Comp_File" (
  "nodeId" int,
  "fileId" int
);

CREATE TABLE "HN_Ports" (
  "portId" SERIAL PRIMARY KEY,
  "port" int,
  "portType" text
);

CREATE TABLE "LN_Comp_Ports" (
  "nodeId" int,
  "portId" int
);

CREATE TABLE "HN_PortRemap" (
  "nodeId" int,
  "portType" text,
  "port" int
);

CREATE TABLE "HN_AdminType" (
  "adminTypeId" SERIAL PRIMARY KEY,
  "adminType" text
);

CREATE TABLE "HN_Admin" (
  "adminId" SERIAL PRIMARY KEY,
  "extensionId" int,
  "nodeId" int,
  "adminTypeId" int,
  "resetPassword" boolean,
  "isSuper" boolean
);

CREATE TABLE "HN_Email" (
  "emailId" SERIAL PRIMARY KEY,
  "sender" text,
  "subject" text,
  "body" varchar
);

CREATE TABLE "LN_attachment_email" (
  "emailId" int,
  "attachmentId" int
);

CREATE TABLE "HN_AttachmentType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE "HN_EmailAttachment" (
  "attachmentId" SERIAL PRIMARY KEY,
  "typeId" int,
  "content" text,
  "comp" text,
  "user" text,
  "pass" text
);

CREATE TABLE "HN_BoardPost" (
  "postingId" SERIAL PRIMARY KEY,
  "title" text,
  "reqs" text,
  "requiredRank" int,
  "content" varchar
);

CREATE TABLE "HN_MissionBranch" (
  "branchId" SERIAL PRIMARY KEY,
  "missionId_1" int,
  "missionId_2" int
);

CREATE TABLE "HN_MGoalType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE "LN_Goal_Mission" (
  "missionId" int,
  "goalId" int
);

CREATE TABLE "HN_MissionGoal" (
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

CREATE TABLE "User" (
  "userId" SERIAL PRIMARY KEY,
  "email" text,
  "username" text,
  "password" varchar,
  "salt" text
);

CREATE TABLE "User_Extension" (
  "userId" int,
  "extensionId" int
);

CREATE TABLE "Extension_Language" (
  "langId" SERIAL PRIMARY KEY,
  "lang" text,
  "Language" text
);

ALTER TABLE "User_Extension" ADD FOREIGN KEY ("userId") REFERENCES "User" ("userId");

ALTER TABLE "User_Extension" ADD FOREIGN KEY ("extensionId") REFERENCES "Extension_Info" ("extensionId");

ALTER TABLE "Extension_Language" ADD FOREIGN KEY ("langId") REFERENCES "Extension_Info" ("languageId");

ALTER TABLE "HN_Theme" ADD FOREIGN KEY ("themeId") REFERENCES "Extension_Info" ("startingThemeId");

ALTER TABLE "HN_Music" ADD FOREIGN KEY ("musicId") REFERENCES "Extension_Info" ("startingMusic");

ALTER TABLE "HN_MGoalType" ADD FOREIGN KEY ("typeId") REFERENCES "HN_MissionGoal" ("typeId");

ALTER TABLE "LN_Goal_Mission" ADD FOREIGN KEY ("missionId") REFERENCES "HN_Mission" ("missionId");

ALTER TABLE "LN_Goal_Mission" ADD FOREIGN KEY ("goalId") REFERENCES "HN_MissionGoal" ("goalId");

ALTER TABLE "HN_Mission" ADD FOREIGN KEY ("nextMission") REFERENCES "HN_Mission" ("missionId");

ALTER TABLE "HN_MissionBranch" ADD FOREIGN KEY ("missionId_1") REFERENCES "HN_Mission" ("missionId");

ALTER TABLE "HN_MissionBranch" ADD FOREIGN KEY ("missionId_2") REFERENCES "HN_Mission" ("missionId");

ALTER TABLE "LN_attachment_email" ADD FOREIGN KEY ("emailId") REFERENCES "HN_Email" ("emailId");

ALTER TABLE "HN_EmailAttachment" ADD FOREIGN KEY ("attachmentId") REFERENCES "LN_attachment_email" ("attachmentId");

ALTER TABLE "HN_Email" ADD FOREIGN KEY ("emailId") REFERENCES "HN_Mission" ("emailId");

ALTER TABLE "HN_BoardPost" ADD FOREIGN KEY ("postingId") REFERENCES "HN_Mission" ("postingId");

ALTER TABLE "HN_Mission" ADD FOREIGN KEY ("missionId") REFERENCES "Extension_Info" ("statingMissionId");

ALTER TABLE "HN_AttachmentType" ADD FOREIGN KEY ("typeId") REFERENCES "HN_EmailAttachment" ("typeId");

ALTER TABLE "LN_Comp_File" ADD FOREIGN KEY ("nodeId") REFERENCES "HN_CompNode" ("nodeId");

ALTER TABLE "HN_CompFile" ADD FOREIGN KEY ("fileId") REFERENCES "LN_Comp_File" ("fileId");

ALTER TABLE "LN_Comp_Ports" ADD FOREIGN KEY ("nodeId") REFERENCES "HN_CompNode" ("nodeId");

ALTER TABLE "HN_Ports" ADD FOREIGN KEY ("portId") REFERENCES "LN_Comp_Ports" ("portId");

ALTER TABLE "HN_PortRemap" ADD FOREIGN KEY ("nodeId") REFERENCES "HN_CompNode" ("nodeId");

ALTER TABLE "HN_Ports" ADD FOREIGN KEY ("portType") REFERENCES "HN_PortRemap" ("portType");

ALTER TABLE "HN_CompNode" ADD FOREIGN KEY ("typeId") REFERENCES "HN_CompType" ("typeId");

ALTER TABLE "HN_CompNode" ADD FOREIGN KEY ("nodeId") REFERENCES "LN_Starting_Comp" ("nodeId");

ALTER TABLE "Extension_Info" ADD FOREIGN KEY ("extensionId") REFERENCES "LN_Starting_Comp" ("extensionId");

ALTER TABLE "HN_AdminType" ADD FOREIGN KEY ("adminTypeId") REFERENCES "HN_Admin" ("adminTypeId");

ALTER TABLE "HN_CompNode" ADD FOREIGN KEY ("nodeId") REFERENCES "HN_Admin" ("nodeId");

ALTER TABLE "HN_Admin" ADD FOREIGN KEY ("extensionId") REFERENCES "Extension_Info" ("extensionId");

ALTER TABLE "Extension_Info" ADD FOREIGN KEY ("extensionId") REFERENCES "HN_Mission" ("extensionId");

ALTER TABLE "Extension_Info" ADD FOREIGN KEY ("extensionId") REFERENCES "HN_CompFile" ("extensionId");
