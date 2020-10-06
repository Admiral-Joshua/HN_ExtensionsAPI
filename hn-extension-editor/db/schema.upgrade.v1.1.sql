CREATE TABLE IF NOT EXISTS change_log (
    "change_id" SERIAL PRIMARY KEY,
    "meta_id" int NOT NULL,
    "object_id" int NOT NULL,
    "object_type_id" int NOT NULL,
    "last_change" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_build" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS change_obj_type (
    "object_type_id" int PRIMARY KEY,
    "object_name" text NOT NULL
);

INSERT INTO change_obj_type VALUES 
(1, 'Extension Info'),
(2, 'Music'),
(3, 'Mission'),
(4, 'Node'),
(5, 'Faction'),
(6, 'Theme'),
(7, 'Conditional ActionSet');


-- EXTENSION INFO CHANGE DETECTION
-- Procedures
CREATE OR REPLACE FUNCTION extensioninfocreation() RETURNS TRIGGER AS $example_table$
    BEGIN
        INSERT INTO change_log (object_id, meta_id, object_type_id, last_change) VALUES (NEW."extensionId", NEW."extensionId", 1, CURRENT_TIMESTAMP);
        PERFORM pg_notify('changelog', '1 ' || NEW."extensionId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION extensioninfoupdated() RETURNS TRIGGER AS $example_table$
    BEGIN
        UPDATE change_log SET last_change = CURRENT_TIMESTAMP WHERE object_id = NEW."extensionId" AND object_type_id = 1;
        PERFORM pg_notify('changelog', '1 ' || NEW."extensionId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION extensioninfodeleted() RETURNS TRIGGER AS $example_table$
    BEGIN
        DELETE FROM change_log WHERE object_id = OLD."extensionId" AND object_type_id = 1;
        PERFORM pg_notify('changelog', '1 ' || OLD."extensionId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER extension_created AFTER INSERT ON "extension_Info"
FOR EACH ROW EXECUTE PROCEDURE extensioninfocreation();

CREATE TRIGGER extension_updated AFTER UPDATE ON "extension_Info"
FOR EACH ROW EXECUTE PROCEDURE extensioninfoupdated();

CREATE TRIGGER extension_deleted AFTER DELETE ON "extension_Info"
FOR EACH ROW EXECUTE PROCEDURE extensioninfodeleted();

-- -------------------------------------------

-- MUSIC CHANGE DETECTION
-- Procedures
CREATE OR REPLACE FUNCTION musictrackcreated() RETURNS TRIGGER AS $example_table$
    BEGIN
        INSERT INTO change_log (meta_id, object_id, object_type_id, last_change) VALUES (NEW."ownerId", NEW."musicId", 2, CURRENT_TIMESTAMP);
        PERFORM pg_notify('changelog', '2 ' || NEW."musicId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION musictrackupdated() RETURNS TRIGGER AS $example_table$
    BEGIN
        UPDATE change_log SET last_change = CURRENT_TIMESTAMP WHERE object_id = NEW."musicId" AND meta_id = NEW."ownerId" AND object_type_id = 2;
        PERFORM pg_notify('changelog', '2 ' || NEW."musicId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION musictrackdeleted() RETURNS TRIGGER AS $example_table$
    BEGIN
        DELETE FROM change_log WHERE object_id = OLD."musicId" AND object_type_id = 2;
        PERFORM pg_notify('changelog', '2 ' || OLD."musicId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER music_created AFTER INSERT ON "hn_Music"
FOR EACH ROW EXECUTE PROCEDURE musictrackcreated();

CREATE TRIGGER music_updated AFTER UPDATE ON "hn_Music"
FOR EACH ROW EXECUTE PROCEDURE musictrackupdated();

CREATE TRIGGER music_deleted AFTER DELETE ON "hn_Music"
FOR EACH ROW EXECUTE PROCEDURE musictrackdeleted();

-- ----------------------------------------------

-- Mission Change Detection
CREATE OR REPLACE FUNCTION missioncreated() RETURNS TRIGGER AS $example_table$
    BEGIN
        INSERT INTO change_log (meta_id, object_id, object_type_id, last_change) VALUES (NEW."extensionId", NEW."missionId", 3, CURRENT_TIMESTAMP);
        PERFORM pg_notify('changelog', '3 ' || NEW."missionId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION missionupdated() RETURNS TRIGGER AS $example_table$
    BEGIN
        UPDATE change_log SET last_change = CURRENT_TIMESTAMP WHERE object_id = NEW."missionId" AND meta_id = NEW."extensionId" AND object_type_id = 3;
        PERFORM pg_notify('changelog', '3 ' || NEW."missionId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION missiondeleted() RETURNS TRIGGER AS $example_table$
    BEGIN
        DELETE FROM change_log WHERE object_id = OLD."missionId" AND object_type_id = 3;
        PERFORM pg_notify('changelog', '3 ' || OLD."missionId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER mission_created AFTER INSERT ON "hn_Mission"
FOR EACH ROW EXECUTE PROCEDURE missioncreated();

CREATE TRIGGER mission_updated AFTER UPDATE ON "hn_Mission"
FOR EACH ROW EXECUTE PROCEDURE missionupdated();

CREATE TRIGGER mission_deleted AFTER DELETE ON "hn_Mission"
FOR EACH ROW EXECUTE PROCEDURE missiondeleted();

-- ----------------------------------------------

-- Computer Node change Detection
CREATE OR REPLACE FUNCTION nodecreated() RETURNS TRIGGER AS $example_table$
    BEGIN
        INSERT INTO change_log (meta_id, object_id, object_type_id, last_change) VALUES (NEW."extensionId", NEW."nodeId", 4, CURRENT_TIMESTAMP);
        PERFORM pg_notify('changelog', '4 ' || NEW."nodeId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION nodeupdated() RETURNS TRIGGER AS $example_table$
    BEGIN
        UPDATE change_log SET last_change = CURRENT_TIMESTAMP WHERE object_id = NEW."nodeId" AND meta_id = NEW."extensionId" AND object_type_id = 4;
        PERFORM pg_notify('changelog', '4 ' || NEW."nodeId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION nodedeleted() RETURNS TRIGGER AS $example_table$
    BEGIN
        DELETE FROM change_log WHERE object_id = OLD."nodeId" AND object_type_id = 4;
        PERFORM pg_notify('changelog', '4 ' || OLD."nodeId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER node_created AFTER INSERT ON "hn_CompNode"
FOR EACH ROW EXECUTE PROCEDURE nodecreated();

CREATE TRIGGER node_updated AFTER UPDATE ON "hn_CompNode"
FOR EACH ROW EXECUTE PROCEDURE nodeupdated();

CREATE TRIGGER node_deleted AFTER DELETE ON "hn_CompNode"
FOR EACH ROW EXECUTE PROCEDURE nodedeleted();

-- ----------------------------------------------

-- Themes change Detection
CREATE OR REPLACE FUNCTION themecreated() RETURNS TRIGGER AS $example_table$
    BEGIN
        INSERT INTO change_log (meta_id, object_id, object_type_id, last_change) VALUES (NEW."extensionId", NEW."themeId", 6, CURRENT_TIMESTAMP);
        PERFORM pg_notify('changelog', '6 ' || NEW."themeId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION themeupdated() RETURNS TRIGGER AS $example_table$
    BEGIN
        UPDATE change_log SET last_change = CURRENT_TIMESTAMP WHERE object_id = NEW."themeId" AND meta_id = NEW."extensionId" AND object_type_id = 6;
        PERFORM pg_notify('changelog', '6 ' || NEW."themeId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION themedeleted() RETURNS TRIGGER AS $example_table$
    BEGIN
        DELETE FROM change_log WHERE object_id = OLD."themeId" AND object_type_id = 6;
        PERFORM pg_notify('changelog', '6 ' || OLD."themeId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER theme_created AFTER INSERT ON "hn_Theme"
FOR EACH ROW EXECUTE PROCEDURE themecreated();

CREATE TRIGGER theme_updated AFTER UPDATE ON "hn_Theme"
FOR EACH ROW EXECUTE PROCEDURE themeupdated();

CREATE TRIGGER theme_deleted AFTER DELETE ON "hn_Theme"
FOR EACH ROW EXECUTE PROCEDURE themedeleted();

-- ----------------------------------------------

-- ActionSet change Detection
CREATE OR REPLACE FUNCTION actionsetcreated() RETURNS TRIGGER AS $example_table$
    BEGIN
        INSERT INTO change_log (meta_id, object_id, object_type_id, last_change) VALUES (NEW."extensionId", NEW."actionSetId", 7, CURRENT_TIMESTAMP);
        PERFORM pg_notify('changelog', '7 ' || NEW."actionSetId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actionsetupdated() RETURNS TRIGGER AS $example_table$
    BEGIN
        UPDATE change_log SET last_change = CURRENT_TIMESTAMP WHERE object_id = NEW."actionSetId" AND meta_id = NEW."extensionId" AND object_type_id = 7;
        PERFORM pg_notify('changelog', '7 ' || NEW."actionSetId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actionsetdeleted() RETURNS TRIGGER AS $example_table$
    BEGIN
        DELETE FROM change_log WHERE object_id = OLD."actionSetId" AND object_type_id = 7;
        PERFORM pg_notify('changelog', '7 ' || OLD."actionSetId");
        RETURN NULL;
    END;
$example_table$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER actionset_created AFTER INSERT ON "hn_ActionSet"
FOR EACH ROW EXECUTE PROCEDURE actionsetcreated();

CREATE TRIGGER actionset_updated AFTER UPDATE ON "hn_ActionCondition"
FOR EACH ROW EXECUTE PROCEDURE actionsetupdated();

CREATE TRIGGER actionset_deleted AFTER DELETE ON "hn_ActionSet"
FOR EACH ROW EXECUTE PROCEDURE actionsetdeleted();

CREATE TABLE IF NOT EXISTS "build_job_status" (
    "job_status_id" SERIAL PRIMARY KEY,
    "status_name" TEXT
);

INSERT INTO "build_job_status" VALUES 
(1, 'Queued'),
(2, 'Running'),
(3, 'Completed'),
(4, 'Cancelled');

CREATE TABLE IF NOT EXISTS "build_job" (
    "job_id" SERIAL PRIMARY KEY,
    "job_status" int,
    "time_submitted" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" int NOT NULL,
    "extension_id" int NOT NULL,
    "rebuild" boolean NOT NULL DEFAULT FALSE,
    "time_started" TIMESTAMP,
    "time_completed" TIMESTAMP
);

/*CREATE TRIGGER actionset_deleted AFTER DELETE ON "change_log"
FOR EACH ROW EXECUTE PROCEDURE buildjob();*/