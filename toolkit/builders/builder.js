const models = require("../models/models.js");
const xmlbuilder = require("xmlbuilder2");
const fs = require("fs");
const NODE_BUILDER = require("./nodes/nodes").NODE_BUILDER;
const EXTINFO_BUILDER = require("./extinfo").EXTENSION_BUILDER;
const MISSION_BUILDER = require("./missions").MISSION_BUILDER;
const knex = require("knex")({
    client: 'pg',
    connection: 'postgres://postgres:postgres@localhost:5432/EXTENSIONS_DB'
});

var BUILD_PATH = `${__dirname}/../BUILD`;
var PATHS = {};

if (!fs.existsSync(BUILD_PATH)) {
    fs.mkdirSync(BUILD_PATH);
}

function initialise(extId) {
    BUILD_PATH = `${BUILD_PATH}/${extId}`;
    if (!fs.existsSync(BUILD_PATH)) {
        fs.mkdirSync(BUILD_PATH);
    }

    PATHS = {
        NODE_PATH: `${BUILD_PATH}/Nodes`,
        MISSIONS_PATH: `${BUILD_PATH}/Mission`,
        MUSIC_PATH: `${BUILD_PATH}/Music`,
        ACTION_PATH: `${BUILD_PATH}/Actions`,
        //SCRIPTS_PATH: `${BUILD_PATH}/Scripts`,
        DOCS_PATH: `${BUILD_PATH}/Docs`
    }

    for (var key in PATHS) {
        let path = PATHS[key];
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }
}

function builder(extId, type, params) {

    switch (type) {
        case models.TYPES.EXT_INFO:
            knex("extension_Info")
                .join("extension_Language", { 'extension_Info.languageId': 'extension_Language.langId' })
                .join("hn_Mission", { 'extension_Info.startingMissionId': 'hn_Mission.missionId' })
                .join("hn_Music", { 'extension_Info.startingMusic': 'hn_Music.musicId' })
                .where('extension_Info.extensionId', 8)
                .first()
                .then(info => {
                    // CREATE EXTENSION_INFO
                    let xml = EXTINFO_BUILDER(info);

                    fs.writeFileSync(`${BUILD_PATH}/ExtensionInfo.xml`, xml);

                    console.log(info);
                });
            break;
        case models.TYPES.NODE:
            let nodeId = params[0];

            knex("hn_CompNode")
                .where({ 'hn_CompNode.nodeId': nodeId })
                .first()
                .then(info => {
                    knex("ln_Comp_File")
                        .where({ nodeId: nodeId })
                        .join('hn_CompFile', { 'ln_Comp_File.fileId': 'hn_CompFile.fileId' })
                        .then(files => {
                            info.files = files;

                            knex("hn_PortRemap")
                                .select(knex.raw('"hn_Ports"."portType" as oldPort'), knex.raw('"hn_PortRemap"."port" as newPort'))
                                .where({ nodeId: nodeId })
                                .join('hn_Ports', { 'hn_Ports.portId': 'hn_PortRemap.portId' })
                                .then(remaps => {
                                    info.remaps = remaps;

                                    knex("ln_Comp_Ports")
                                        .where({ nodeId: nodeId })
                                        .join('hn_Ports', { 'hn_Ports.portId': 'ln_Comp_Ports.portId' })
                                        .then(ports => {
                                            info.ports = ports;

                                            let xml = NODE_BUILDER(info);

                                            fs.writeFileSync(`${PATHS.NODE_PATH}/${info.id}.xml`, xml);

                                            console.log(info);
                                        });
                                });
                        });
                });
            break;
        case models.TYPES.MISSION_FILE:
            let missionId = params[0];

            knex("hn_Mission")
                .where({ missionId: missionId })
                .leftJoin("hn_Email", { 'hn_Email.emailId': 'hn_Mission.emailId' })
                .leftJoin("hn_BoardPost", { 'hn_BoardPost.postingId': 'hn_Mission.postingId' })
                .first()
                .then(info => {
                    knex("ln_Goal_Mission")
                        .where({ missionId: missionId })
                        .join('hn_MissionGoal', { 'hn_MissionGoal.goalId': 'ln_Goal_Mission.goalId' })
                        .leftJoin('hn_MGoalType', { 'hn_MGoalType.typeId': 'hn_MissionGoal.typeId' })
                        .then(goals => {
                            info.goals = goals;

                            let xml = MISSION_BUILDER(info);
                            fs.writeFileSync(`${PATHS.MISSIONS_PATH}/${info.id}.xml`, xml);

                            console.log(info);
                        })
                })

            break;
        case models.TYPES.ALL_NODES:
            // Retrieve list of Computers in this extension
            knex("hn_CompNode")
                .where({ extensionId: extId })
                .then(nodes => {
                    nodes.forEach(node => {
                        builder(extId, models.TYPES.NODE, [node.nodeId]);
                    });
                });
            break;
        case models.TYPES.ACTIONSET:
            // Retrieve detailed information about this actionset

        case models.TYPES.ALL:
            builder(extId, models.TYPES.EXT_INFO);
            builder(extId, models.TYPES.ALL_NODES);
            break;
    }
}
initialise(8);

builder(8, models.TYPES.ALL);
//builder(8, models.TYPES.MISSION_FILE, [1]);
//process.exit();