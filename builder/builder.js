//const xmlbuilder = require("xmlbuilder2");
const create = require("xmlbuilder2").create;
const config = require("../config.json");
const fs = require("fs");
const knex = require("knex")({
    client: "pg",
    connection: `postgres://${config.db.user}:${config.db.pass}@${config.db.host}:${config.db.port}/${config.db.schema}`
});

var BUILD_PATH = "";

function BuildCompNode(node) {
    // Start with the root.
    var compNode = create().ele('Computer');

    // Initial computer attributes.
    compNode.att('id', node.id);
    compNode.att('name', node.name);
    compNode.att('ip', node.ip);
    compNode.att('security', node.securityLevel);
    compNode.att('allowsDefaultBootModule', node.allowsDefaultBootModule);
    compNode.att('icon', node.icon);
    compNode.att('type', node.typeId);

    // Set Admin Password
    let adminPassEl = compNode.ele('adminPass');
    adminPassEl.att('pass', node.adminPass);

    // Set-up ports
    let portsEl = compNode.ele('ports');

    var portList = "";
    node.ports.forEach(port => {
        portList += `${port.port},`;
    });
    portsEl.txt(portList.substring(0, portList.length - 1));

    // Set-up portsForCrack
    let portCrackEl = compNode.ele('portsForCrack');
    portCrackEl.att('val', node.portsForCrack || 0);

    // Set-up traceTime
    let traceTimeEl = compNode.ele('trace');
    if (node.traceTime <= 0) {
        node.traceTime = -1;
    }
    traceTimeEl.att('time', node.traceTime);

    // Set-up adminType
    let adminEl = compNode.ele('admin');
    adminEl.att('type', node.adminType || 'none');
    adminEl.att('resetPassword', node.resetPassword);
    adminEl.att('isSuper', node.isSuper);

    // Set-up port remaps
    let remaps = "";
    node.remaps.forEach(remap => {
        remaps += `${remap.portType.toLowerCase()}=${remap.newPort},`;
    });
    if (remaps.length > 0) {
        let portRemapEl = compNode.ele('portRemap');
        portRemapEl.txt(remaps.substring(0, remaps.length - 1));
    }

    // Set-up DLINKs
    node.dlinks.forEach(dlink => {
        let dlinkEl = compNode.ele('dlink');
        dlinkEl.att('target', dlink.id);
    })

    // Set-up files
    node.files.forEach(file => {
        let fileEl = compNode.ele('file');
        fileEl.att('path', file.path);
        fileEl.att('name', file.name);
        fileEl.txt(file.contents);
    });

    let doc = compNode.end({ prettyPrint: true });
    let xml = doc.toString();
    fs.writeFileSync(`${PATHS.NODE_PATH}/${node.id.replace(" ", "_")}.xml`, xml);
}

function buildComputers(extensionId) {
    // Query for most of the computer information.
    knex("hn_CompNode")
        .leftJoin('hn_Admin', { 'hn_CompNode.adminInfoId': 'hn_Admin.adminId' })
        .leftJoin('hn_AdminType', { 'hn_AdminType.adminTypeId': 'hn_Admin.adminTypeId' })
        .where({ 'hn_CompNode.extensionId': extensionId })
        .then(nodes => {

            nodes.forEach((node, idx) => {
                // Retrieve a list of files that this computer has on it.

                knex("ln_Comp_File")
                    .where({ nodeId: node.nodeId })
                    .join('hn_CompFile', { 'ln_Comp_File.fileId': 'hn_CompFile.fileId' })
                    .then(files => {
                        node.files = files;

                        // Retrieve a list of ports this computer has on it.
                        knex("ln_Comp_Ports")
                            .where({ nodeId: node.nodeId })
                            .join('hn_Ports', { 'ln_Comp_Ports.portId': 'hn_Ports.portId' })
                            .then(ports => {
                                node.ports = ports;

                                // Retrieve list of DLINKs from this computer
                                knex("ln_Comp_Dlink")
                                    .where({ srcNodeId: node.nodeId })
                                    .join("hn_CompNode", { 'hn_CompNode.nodeId': 'ln_Comp_Dlink.destNodeId' })
                                    .select("hn_CompNode.id")
                                    .then(dlinks => {
                                        node.dlinks = dlinks;

                                        // Finally, retrieve all portRemaps this computer has.
                                        knex("hn_PortRemap")
                                            .select(knex.raw('"hn_PortRemap"."port" as "newPort"'), "hn_Ports.*")
                                            .join('hn_Ports', { 'hn_PortRemap.portId': 'hn_Ports.portId' })
                                            .where({ nodeId: node.nodeId })
                                            .then(remaps => {
                                                node.remaps = remaps;

                                                BuildCompNode(node);

                                                // Last one?
                                                if (idx === nodes.length - 1) {
                                                    process.exit();
                                                }
                                            });
                                    });
                            });
                    });

            });


        });


}

/*function BuildGoalNode(parent, goal) {

}*/

function BuildMissionNode(mission) {
    // Start the root node off.
    var missionNode = create().ele('mission');

    // Set-up base attributes
    missionNode.att('id', mission.id);
    missionNode.att('activeCheck', mission.activeCheck);
    missionNode.att('shouldIgnoreSenderVerification', mission.shouldIgnoreSenderVerification);

    //Set-up goals
    var goalsNode = missionNode.ele('goals');
    mission.goals.forEach(goal => {
        var goalEl = goalsNode.ele('goal');
        goalEl.att('type', goal.typeText);
        goalEl.att('target', goal.targetCompId);
        goalEl.att('file', goal.file);
        goalEl.att('path', goal.path);
        goalEl.att('keyword', goal.keyword);
        goalEl.att('removal', goal.removal);
        goalEl.att('caseSensitive', goal.caseSensitive);
        goalEl.att('owner', goal.owner);
        goalEl.att('degree', goal.degree);
        goalEl.att('uni', goal.uni);
        goalEl.att('gpa', goal.gpa);
        goalEl.att('mailServer', goal.mailServer);
        goalEl.att('recipient', goal.recipient);
        goalEl.att('subject', goal.subject);
    });

    // Set-up mission actions/events
    var mStartEl = missionNode.ele('missionStart');
    mStartEl.txt(mission.missionStart);
    var mEndEl = missionNode.ele('missionEnd');
    mStartEl.txt(mission.missionEnd);

    // Does this mission follow to another?
    var nextMissionEl = missionNode.ele('nextMission');
    nextMissionEl.att('IsSilent', mission.IsSilent);
    if (mission.nextMission) {
        nextMissionEl.txt(`${PATHS.MISSION_PATH}/${mission.NextMission}.xml`);
    } else {
        nextMissionEl.txt('NONE');
    }

    // Connect the branch missions
    var branchesEl = missionNode.ele('branchMissions');
    mission.branches.forEach(branch => {
        let branchEl = branchesEl.ele('branch');
        branchEl.txt(`${PATHS.MISSION_PATH}/${branch.id}.xml`);
    });

    // Create the board posting
    if (mission.postingId > 0) {
        var postingEl = missionNode.ele('posting');
        postingEl.att('title', mission.postingTitle);
        postingEl.att('reqs', mission.reqs);
        postingEl.att('requiredRank', mission.requiredRank);
        postingEl.txt(mission.content);
    }

    // Create the email
    if (mission.emailId > 0) {
        var emailEl = missionNode.ele('email');
        var subjectEl = emailEl.ele('sender');
        subjectEl.txt(mission.subject);
        var senderEl = emailEl.ele('sender');
        senderEl.txt(mission.sender);
        var bodyEl = emailEl.ele('body');
        bodyEl.txt(mission.body);

        // Create attachments

    }

    let doc = missionNode.end({ prettyPrint: true });
    let xml = doc.toString();

    fs.writeFileSync(`${PATHS.MISSION_PATH}/${mission.id}.xml`, xml);
}

function buildMissions(extensionId) {
    knex("hn_Mission")
        //.leftJoin(knex.raw('"hn_Mission" as "nextMission"'), { 'nextMission.missionId': 'hn_Mission.nextMission' })
        .leftJoin("hn_Email", { 'hn_Mission.emailId': 'hn_Email.emailId' })
        .leftJoin("hn_BoardPost", { 'hn_Mission.postingId': 'hn_BoardPost.postingId' })
        .where({ 'hn_Mission.extensionId': extensionId })
        .then(missions => {
            missions.forEach(mission => {
                // Retrieve a list of goals for this mission
                knex("ln_Goal_Mission")
                    .join('hn_MissionGoal', { 'ln_Goal_Mission.goalId': 'hn_MissionGoal.goalId' })
                    .leftJoin('hn_CompNode', { 'hn_MissionGoal.targetNodeId': 'hn_CompNode.nodeId' })
                    .join('hn_MGoalType', { 'hn_MissionGoal.typeId': 'hn_MGoalType.typeId' })
                    .select('ln_Goal_Mission.*', 'hn_MissionGoal.*', 'hn_MGoalType.*', knex.raw('"hn_CompNode"."id" as targetCompId'))
                    .where({ missionId: mission.missionId })
                    .then(goals => {
                        mission.goals = goals;

                        // Retrieve any branches this mission might have
                        knex("hn_MissionBranch")
                            .join('hn_Mission', { 'hn_Mission.missionId': 'hn_MissionBranch.missionId_2' })
                            .where({ missionId_1: mission.missionId })
                            .then(branches => {
                                mission.branches = branches;

                                BuildMissionNode(mission);
                            });
                    });
            });

        });
}


function BuildExtension(extensionId) {
    buildComputers(extensionId);
    buildMissions(extensionId);
};



var BUILD_PATH = `${__dirname}/user_data/Test_Extension`;

const PATHS = {
    NODE_PATH: `${BUILD_PATH}/Nodes`,
    MISSION_PATH: `${BUILD_PATH}/Missions`
};

BuildExtension(2);