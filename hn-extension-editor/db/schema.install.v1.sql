CREATE TABLE IF NOT EXISTS "extension_Info" (
  "extensionId" SERIAL PRIMARY KEY,
  "extensionName" text,
  "languageId" int,
  "allowSaves" boolean,
  "description" varchar,
  "startingThemeId" int,
  "startingMusic" int,
  "startingMissionId" int,
  "workshop_description" varchar,
  "workshop_language" text,
  "workshop_visibility" int,
  "workshop_tags" varchar,
  "workshop_img" text,
  "workshop_id" text
);

CREATE TABLE IF NOT EXISTS "hn_Music" (
  "musicId" SERIAL PRIMARY KEY,
  "ownerId" int,
  "title" text
);

CREATE TABLE IF NOT EXISTS "hn_Mission" (
  "missionId" SERIAL PRIMARY KEY,
  "extensionId" int,
  "id" text,
  "activeCheck" boolean,
  "shouldIgnoreSenderVerification" boolean,
  "missionStart" text,
  "missionEnd" text,
  "nextMission" int,
  "IsSilent" boolean,
  "emailId" int,
  "postingId" int
);

CREATE TABLE IF NOT EXISTS "hn_CompNode" (
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

CREATE TABLE IF NOT EXISTS "ln_Starting_Comp" (
  "extensionId" int,
  "nodeId" int
);

CREATE TABLE IF NOT EXISTS "hn_CompType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE IF NOT EXISTS "hn_CompFile" (
  "fileId" SERIAL PRIMARY KEY,
  "extensionId" int,
  "path" text,
  "name" text,
  "contents" varchar
);

CREATE TABLE IF NOT EXISTS "ln_Comp_File" (
  "nodeId" int,
  "fileId" int
);

CREATE TABLE IF NOT EXISTS "hn_Ports" (
  "portId" SERIAL PRIMARY KEY,
  "port" int,
  "portType" text
);

CREATE TABLE IF NOT EXISTS "ln_Comp_Ports" (
  "nodeId" int,
  "portId" int
);

CREATE TABLE IF NOT EXISTS "hn_PortRemap" (
  "nodeId" int,
  "portId" int,
  "port" int
);

CREATE TABLE IF NOT EXISTS "hn_AdminType" (
  "adminTypeId" SERIAL PRIMARY KEY,
  "adminType" text
);

CREATE TABLE IF NOT EXISTS "hn_Admin" (
  "adminId" SERIAL PRIMARY KEY,
  "extensionId" int,
  -- "nodeId" int,
  "adminTypeId" int,
  "resetPassword" boolean,
  "isSuper" boolean
);

CREATE TABLE IF NOT EXISTS "hn_Email" (
  "emailId" SERIAL PRIMARY KEY,
  "sender" text,
  "subject" text,
  "body" varchar
);

CREATE TABLE IF NOT EXISTS "ln_attachment_email" (
  "emailId" int,
  "attachmentId" int
);

CREATE TABLE IF NOT EXISTS "hn_AttachmentType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE IF NOT EXISTS "hn_EmailAttachment" (
  "attachmentId" SERIAL PRIMARY KEY,
  "typeId" int,
  "content" text,
  "comp" text,
  "user" text,
  "pass" text
);

CREATE TABLE IF NOT EXISTS "hn_BoardPost" (
  "postingId" SERIAL PRIMARY KEY,
  "title" text,
  "reqs" text,
  "requiredRank" int,
  "content" varchar
);

CREATE TABLE IF NOT EXISTS "hn_MissionBranch" (
  "branchId" SERIAL PRIMARY KEY,
  "missionId_1" int,
  "missionId_2" int
);

CREATE TABLE IF NOT EXISTS "hn_MGoalType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE IF NOT EXISTS "ln_Goal_Mission" (
  "missionId" int,
  "goalId" int
);

CREATE TABLE IF NOT EXISTS "hn_MissionGoal" (
  "goalId" SERIAL PRIMARY KEY,
  "typeId" int,
  "targetNodeId" int,
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

CREATE TABLE IF NOT EXISTS "hn_Faction" (
  "factionId" SERIAL PRIMARY KEY,
  "extensionId" int,
  "name" text,
  "id" text,
  "playerVal" int,
  "actionSetId" int
);

CREATE TABLE IF NOT EXISTS "hn_ActionType" (
  "typeId" SERIAL PRIMARY KEY,
  "typeText" text
);

CREATE TABLE IF NOT EXISTS "hn_ActionSet" (
  "actionSetId" SERIAL PRIMARY KEY,
  "name" text
);

CREATE TABLE IF NOT EXISTS "hn_Action" (
  "actionId" SERIAL PRIMARY KEY,
  "typeId" int,
  "loadActionSetId" int,
  "loadMissionId" int,
  "switchThemeId" int,
  "fileId" int,
  "ircMessageId" int,
  "delayCompId" int,
  "Delay" real,
  "targetCompId" int,
  "functionId" int,
  "functionValue" text
);

CREATE TABLE IF NOT EXISTS "hn_Function" (
  "functionId" SERIAL PRIMARY KEY,
  "funcDisplayName" text,
  "funcName" text
);

CREATE TABLE IF NOT EXISTS "LN_action_reqs" (
    "actionSetId" int,
    "requirementId" int
);

CREATE TABLE IF NOT EXISTS "LN_action_set" (
    "actionSetId" int,
    "actionId" int
);

CREATE TABLE IF NOT EXISTS "hn_ActionRequirement" (
  "requirementId" SERIAL PRIMARY KEY,
  "flag" text,
  "value" int
);

CREATE TABLE IF NOT EXISTS "user_Extension" (
  "userId" int,
  "extensionId" int
);

CREATE TABLE IF NOT EXISTS "extension_Language" (
  "langId" SERIAL PRIMARY KEY,
  "lang" text,
  "Language" text
);

CREATE TABLE IF NOT EXISTS "hn_ircMessage" (
	"ircMessageId" SERIAL PRIMARY KEY,
	"authorId" int,
	"message" varchar
);

CREATE TABLE IF NOT EXISTS "hn_ircUser" (
	"ircUserId" SERIAL PRIMARY KEY,
	"nodeId" int,
	"displayName" text
);

CREATE TABLE IF NOT EXISTS "ln_Comp_Dlink" (
	"srcNodeId" int,
	"destNodeId" int
);

-- Themes Tables
CREATE TABLE IF NOT EXISTS "hn_Theme" (
  "themeId" SERIAL PRIMARY KEY,
  "extensionId" int,

  "LayoutName" text,
  "BackgroundImagePath" text,
  "defaultHighlightColor" text,
  "defaultTopBarColor" text,
  "moduleColorSolidDefault" text,
  "moduleColorStrong" text,
  "moduleColorBacking" text,
  "exeModuleTopBar" text,
  "exeModuleTitleText" text,
  "warningColor" text,
  "subtleTextColor" text,
  "darkBackgroundColor" text,
  "indentBackgroundColor" text,
  "outlineColor" text,
  "lockedColor" text,
  "brightLockedColor" text,
  "brightUnlockedColor" text,
  "unlockedColor" text,
  "lightGray" text,
  "shellColor" text,
  "shellButtonColor" text,
  "semiTransText" text,
  "terminalTextColor" text,
  "topBarTextColor" text,
  "superLightWhite" text,
  "connectedNodeHighlight" text,
  "netmapToolTipColor" text,
  "netmapToolTipBackground" text,
  "topBarIconsColor" text,
  "thisComputerNode" text,
  "scanlinesColor" text
);

ALTER TABLE "user_Extension" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "extension_Info" ADD FOREIGN KEY ("languageId") REFERENCES "extension_Language" ("langId");
ALTER TABLE "extension_Info" ADD FOREIGN KEY ("startingThemeId") REFERENCES "hn_Theme" ("themeId");
ALTER TABLE "extension_Info" ADD FOREIGN KEY ("startingMusic") REFERENCES "hn_Music" ("musicId");
ALTER TABLE "extension_Info" ADD FOREIGN KEY ("startingMissionId") REFERENCES "hn_Mission" ("missionId");


ALTER TABLE "hn_MissionGoal" ADD FOREIGN KEY ("typeId") REFERENCES "hn_MGoalType" ("typeId");
ALTER TABLE "ln_Goal_Mission" ADD FOREIGN KEY ("missionId") REFERENCES "hn_Mission" ("missionId");
ALTER TABLE "ln_Goal_Mission" ADD FOREIGN KEY ("goalId") REFERENCES "hn_MissionGoal" ("goalId");

ALTER TABLE "hn_Mission" ADD FOREIGN KEY ("nextMission") REFERENCES "hn_Mission" ("missionId");
ALTER TABLE "hn_Mission" ADD FOREIGN KEY ("emailId") REFERENCES "hn_Email" ("emailId");
ALTER TABLE "hn_Mission" ADD FOREIGN KEY ("postingId") REFERENCES "hn_BoardPost" ("postingId");
ALTER TABLE "hn_Mission" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "hn_MissionBranch" ADD FOREIGN KEY ("missionId_1") REFERENCES "hn_Mission" ("missionId");
ALTER TABLE "hn_MissionBranch" ADD FOREIGN KEY ("missionId_2") REFERENCES "hn_Mission" ("missionId");

ALTER TABLE "ln_attachment_email" ADD FOREIGN KEY ("emailId") REFERENCES "hn_Email" ("emailId");
ALTER TABLE "ln_attachment_email" ADD FOREIGN KEY ("attachmentId") REFERENCES "hn_EmailAttachment" ("attachmentId");

ALTER TABLE "hn_EmailAttachment" ADD FOREIGN KEY ("typeId") REFERENCES "hn_AttachmentType" ("typeId");

ALTER TABLE "ln_Comp_File" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "ln_Comp_File" ADD FOREIGN KEY ("fileId") REFERENCES "hn_CompFile" ("fileId");

ALTER TABLE "ln_Comp_Ports" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "ln_Comp_Ports" ADD FOREIGN KEY ("portId") REFERENCES "hn_Ports" ("portId");

ALTER TABLE "hn_PortRemap" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "hn_PortRemap" ADD FOREIGN KEY ("portId") REFERENCES "hn_Ports" ("portId");

ALTER TABLE "hn_CompNode" ADD FOREIGN KEY ("typeId") REFERENCES "hn_CompType" ("typeId");
ALTER TABLE "hn_CompNode" ADD FOREIGN KEY ("adminInfoId") REFERENCES "hn_Admin" ("adminId");

ALTER TABLE "ln_Comp_Dlink" ADD FOREIGN KEY ("srcNodeId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "ln_Comp_Dlink" ADD FOREIGN KEY ("destNodeId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "ln_Comp_Dlink" ADD CONSTRAINT dlink_unique UNIQUE ("srcNodeId", "destNodeId");

ALTER TABLE "ln_Starting_Comp" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "ln_Starting_Comp" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "hn_Admin" ADD FOREIGN KEY ("adminTypeId") REFERENCES "hn_AdminType" ("adminTypeId");
ALTER TABLE "hn_Admin" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "hn_CompFile" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "hn_Theme" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");

ALTER TABLE "hn_Faction" ADD FOREIGN KEY ("extensionId") REFERENCES "extension_Info" ("extensionId");
ALTER TABLE "hn_Faction" ADD FOREIGN KEY ("actionSetId") REFERENCES "hn_ActionSet" ("actionSetId");

ALTER TABLE "hn_Action" ADD FOREIGN KEY ("typeId") REFERENCES "hn_ActionType" ("typeId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("loadActionSetId") REFERENCES "hn_ActionSet" ("actionSetId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("loadMissionId") REFERENCES "hn_Mission" ("missionId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("switchThemeId") REFERENCES "hn_Theme" ("themeId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("fileId") REFERENCES "hn_CompFile" ("fileId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("ircMessageId") REFERENCES "hn_ircMessage" ("ircMessageId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("delayCompId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("targetCompId") REFERENCES "hn_CompNode" ("nodeId");
ALTER TABLE "hn_Action" ADD FOREIGN KEY ("functionId") REFERENCES "hn_Function" ("functionId");

ALTER TABLE "LN_action_reqs" ADD FOREIGN KEY ("actionSetId") REFERENCES "hn_ActionSet" ("actionSetId");
ALTER TABLE "LN_action_reqs" ADD FOREIGN KEY ("requirementId") REFERENCES "hn_ActionRequirement" ("requirementId");

ALTER TABLE "hn_ircMessage" ADD FOREIGN KEY ("authorId") REFERENCES "hn_ircUser" ("ircUserId");
ALTER TABLE "hn_ircUser" ADD FOREIGN KEY ("nodeId") REFERENCES "hn_CompNode" ("nodeId");