-- Fetch Extension Info

-- Required Fields
--  Language (in lang code i.e. en-us)
--  Name
--  AllowSaves
--  StartingVisibleNodes (csv of ids)
--  StartingMission - Templated as Missions/<ID>.xml
--  StartingActions (not yet implemented) --> Will be Templated as "Actions/<ID>.xml"
--  Description
--  Faction Definitions (not yet implemented)
--  StartsWithTutorial (not implemented) --> DEFAULT: "false"
--  HasIntroStartup (not yet implemented) --> DEFAULT: "true"
--  StartingTheme - Templated as Themes/<ID>.xml
-- IntroStartupSong -> Special Case
    -- If OwnerID == 0 { 
    --      Use "hn_Music"."title"
    -- } ELSE {
    --      Use Music/<ID>.xml
    -- }
-- Sequencer Info (not yet implemented)
-- WorkshopDescription
-- WorkshopVisiblity --> 
-- WorkshopTags --> Default: ""
-- WorkshopPreviewImagePath --> Default "NONE"
-- WorkshopPublishID --> Default "NONE"

SELECT "extension_Info"."extensionId", "extensionName", "extension_Language"."lang", "allowSaves", "description", "hn_Mission"."id" as "startingMission", "description", "startingThemeId", "workshop_description", "workshop_language", "workshop_visibility", "workshop_tags", "workshop_img", "workshop_id"
FROM "extension_Info"
INNER JOIN "extension_Language" ON "extension_Language"."langId" = "extension_Info"."languageId"
LEFT JOIN "hn_Mission" ON "hn_Mission"."missionId" = "extension_Info"."startingMissionId"
WHERE "extension_Info"."extensionId" = ?;

-- Starting Nodes have to be queried seperately due to Many-To-Many relationship
-- One could use a GROUP_CONCAT in the query above, but PostgreSQL is a bit finicky about that
-- Once all rows are fetched, just join them together in a csv format.
--  E.g. jrn-laptop-01,test-pc-1,example-pc-2
SELECT "hn_CompNode"."id"
FROM "ln_Starting_Comp"
LEFT JOIN "hn_CompNode" ON "hn_CompNode"."nodeId" = "ln_Starting_Comp"."nodeId"
WHERE "ln_Starting_Comp"."extensionId" = ?;