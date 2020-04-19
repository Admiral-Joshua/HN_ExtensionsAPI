-- Fetching and building of Missions for a Hacknet extension
-- Make sure to create all of these under a new directory in the "BUILD_PATH"
-- Name it: "Missions"

-- Retrieve list of missions that will be available under this Hacknet extension --> Brings with it much of the required information
--  minus goals which will have to be queried for each mission using the second query below.
-- @PARAM: "extensionId" --> ID of the extension currently being built.
SELECT "missionId", "id", "activeCheck", "shouldIgnoreSenderVerification", "missionStart", "missionEnd", "nextMission", "IsSilent", "hn_Email"."emailId", "hn_Email"."subject", "hn_Email"."sender", "hn_Email"."body", "hn_BoardPost"."postingId", "hn_BoardPost"."title", "hn_BoardPost"."reqs", "hn_BoardPost"."requiredRank", "hn_BoardPost"."content"
FROM "hn_Mission"
LEFT JOIN "hn_Email" ON "hn_Email"."emailId" = "hn_Mission"."emailId"
LEFT JOIN "hn_BoardPost" ON "hn_BoardPost"."postingId" = "hn_Mission"."postingId"
WHERE "hn_Mission"."extensionId" = ?;

-- In the event that a mission contains an email (should always be the case) (I.E. emailId > 0)
-- Then a list of attachments for said email will also need to be retrieved
-- @PARAM: "emailId" --> ID of the email you want to retrieve a list of attachments for
SELECT "hn_AttachmentType"."typeText", "hn_EmailAttachment"."content", "hn_EmailAttachment"."comp", "hn_EmailAttachment"."user", "hn_EmailAttachment"."pass" 
FROM "ln_attachment_email"
INNER JOIN "hn_EmailAttachment" ON "hn_EmailAttachment"."attachmentId" = "ln_attachment_email"."attachmentId"
INNER JOIN "hn_AttachmentType" ON "hn_EmailAttachment"."typeId" = "hn_AttachmentType"."typeId"
WHERE "ln_attachment_email"."emailId" = ?;


-- Retrieve all goals for a specific mission.
-- Sadly this is where things get a bit tricky, each goal type has different attributes required for each goal!
-- Check out the full example of XML file here: https://pastebin.com/WtFLbQvH
-- It's up the implementer whether they want to use the text names defined under the "hn_MGoalType" table,
--  or whether they use the "typeText" column returned by this query.
-- @PARAM: "missionId" --> ID of the mission you want to retrieve a list of goals for
SELECT "hn_MGoalType"."typeText", "hn_CompNode"."id" as "targetNode", "hn_MissionGoal"."file", "hn_MissionGoal"."path", "hn_MissionGoal"."keyword", "hn_MissionGoal"."removal", "hn_MissionGoal"."caseSensitive", "hn_MissionGoal"."owner", "hn_MissionGoal"."degree", "hn_MissionGoal"."uni", "hn_MissionGoal"."gpa", "hn_MissionGoal"."mailServer", "hn_MissionGoal"."recipient", "hn_MissionGoal"."subject", "hn_MissionGoal"."target" as "targetString", "hn_MissionGoal"."delay"
FROM "ln_Goal_Mission"
INNER JOIN "hn_MissionGoal" ON "hn_MissionGoal"."goalId" = "ln_Goal_Mission"."goalId"
INNER JOIN "hn_MGoalType" ON "hn_MGoalType"."typeId" = "hn_MissionGoal"."typeId"
LEFT JOIN "hn_CompNode" ON "hn_CompNode"."nodeId" = "hn_MissionGoal"."targetNodeId"
WHERE "ln_Goal_Mission"."missionId" = ?;