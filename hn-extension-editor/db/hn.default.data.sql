-- hn_Music
-- DEFAULT records
INSERT INTO "hn_Music" ("musicId", "ownerId", "title") VALUES
-- STANDARD HACKNET MUSIC FILES
(1, 0, 'Revolve'),
(2, 0, 'The_Quickening'),
(3, 0, 'TheAlgorithm'),
(4, 0, 'Ryan3'),
(5, 0, 'Bit(Ending)'),
(6, 0, 'Rico_Puestel-Roja_Drifts_By'),
(7, 0, 'out_run_the_wolves'),
(8, 0, 'Irritations'),
(9, 0, 'Broken_Boy'),
(10, 0, 'Ryan10'),
(11, 0, 'tetrameth'),
(12, 0, 'DreamHead'),
(13, 0, 'HOME_Resonance'),
(14, 0, 'Remi_Finale'),
(15, 0, 'Remi2'),
(16, 0, 'RemiDrone'),
(17, 0, 'Slow_Motion'),
(18, 0, 'snidelyWhiplash'),
(19, 0, 'Uberspacelike'),
(20, 0, 'World_Chase')
ON CONFLICT ("musicId") DO NOTHING;
-- TODO: ADD DLC_Music tracks

-- hn_MGoalType
-- List of goal types currently available within Hacknet
INSERT INTO "hn_MGoalType" ("typeId", "typeText") VALUES
(1, 'filedeletion'),
(2, 'clearfolder'),
(3, 'filedownload'),
(4, 'filechange'),
(5, 'getadmin'),
(6, 'getstring'),
(7, 'delay'),
(8, 'hasFlag'),
(9, 'fileupload'),
(10, 'AddDegree'),
(11, 'wipedegrees'),
(12, 'sendemail'),
-- DLC Mission Goals
(13, 'getadminpasswordstring') ON CONFLICT ("typeId") DO NOTHING;

-- extension_Language
-- List of languages supported by Hacknet
INSERT INTO "extension_Language" ("langId", "lang", "Language") VALUES
(1, 'en-us', 'English'),
(2, 'de-de', 'German'),
(3, 'fr-be', 'French'),
(4, 'ru-ru', 'Russian'),
(5, 'es-ar', 'Spanish'),
(6, 'ko-kr', 'Korean'),
(7, 'ja-jp', 'Japanese'),
(8, 'zh-cn', 'Chinese, simplified') ON CONFLICT ("langId") DO NOTHING;

-- hn_Ports
-- List of security ports supported by Hacknet
INSERT INTO "hn_Ports" ("portId", "port", "portType") VALUES
(1, 21, 'FTP'),
(2, 22, 'SSH'),
(3, 25, 'SMTP'),
(4, 80, 'WEB'),
(5, 1433, 'SQL'),
(6, 104, 'MEDICAL'),
(7, 6881, 'BITTORRENT'),
(8, 443, 'SSL'),
(9, 192, 'PACIFIC'),
(10, 554, 'RTSP') ON CONFLICT ("portId") DO NOTHING;

-- hn_CompType
-- List of Computer defaults for Hacknet, useful for starting templates
INSERT INTO "hn_CompType" ("typeId", "typeText") VALUES
(1, 'Corporate'),
(2, 'Home'),
(3, 'Server'),
(4, 'Empty') ON CONFLICT ("typeId") DO NOTHING;

-- hn_AdminType
-- Admin types currently supported by Hacknet
INSERT INTO "hn_AdminType" ("adminTypeId", "adminType") VALUES 
(1, 'basic'),
(2, 'progress'),
(3, 'fast'),
(4, 'none') ON CONFLICT ("adminTypeId") DO NOTHING;

-- hn_AttachmentType
-- Types of attachments available for an email.
INSERT INTO "hn_AttachmentType" ("typeId", "typeText") VALUES
(1, 'note'),
(2, 'link'),
(3, 'account') ON CONFLICT ("typeId") DO NOTHING;