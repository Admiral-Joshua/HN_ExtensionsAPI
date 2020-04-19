-- IMPLEMENTER NOTE: Currently User Accounts are not implemented in the schema,
--  and so, for the time being the <account> tags can safely be disregarded for generated computers.

-- Fetching and building of Computers for a Hacknet extension
-- Make sure to create all of these under a new directory in the "BUILD_PATH"
-- Name it: "Nodes"

-- Get all Nodes that will be present in the extension being built.
SELECT "id", "name", "ip", "securityLevel", "allowsDefaultBootModule", "icon", "typeId", "adminPass", "portsForCrack", "traceTime", "adminInfoId", "tracker"
FROM "hn_CompNode"
WHERE "extensionId" = ?;

-- Generate seperate XML file for each row and store it under the Nodes directory with the filename as the id of the computer:
-- E.g. Nodes/jrn-laptop-01.xml

-- Each computer contains a definition as to what ports should be active on the computer
-- As a many-to-many relationship, the ports are queried seperately, per computer
-- E.g. <ports> tag will look something like: <ports>21,22,80</ports>

-- @PARAM: "nodeId" --> ID of the computer you want to retrieve a list of ports for
SELECT *
FROM "ln_Comp_Ports"
INNER JOIN "hn_Ports" ON "hn_Ports"."portId" = "ln_Comp_Ports"."portId"
WHERE "ln_Comp_Ports"."nodeId" = ?;


-- Each computer contains within it, a list of files that the computer should contain
-- These will translate to single <file> tags in this computer's XML data
-- Sadly, again as Many-To-Many these are best queried seperately
-- E.g. file tag: <file path="home" name="downloadFile.txt">This is a file for some of the goals in ExampleMission.xml</file>
-- @PARAM: "nodeId" --> ID of the computer you want to retrieve a list of files for
SELECT "hn_CompFile"."path", "hn_CompFile"."name", "hn_CompFile"."contents"
FROM "ln_Comp_File"
INNER JOIN "hn_CompFile" ON "hn_CompFile"."fileId" = "ln_Comp_File"."fileId"
WHERE "ln_Comp_File"."nodeId" = ?;