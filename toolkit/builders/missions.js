const xmlbuilder = require("xmlbuilder2");

module.exports = {
    MISSION_BUILDER: (info) => {
        var MissionInfo = {
            mission: {
                '@id': info.id,
                '@activeCheck': info.activeCheck,
                '@shouldIgnoreSenderVerification': info.shouldIgnoreSenderVerification,

                goals: {
                    goal: info.goals.map(goal => {
                        return {
                            '@type': goal.typeText,
                        }
                    })
                },
                missionStart: info.missionStart,
                missionEnd: info.missionEnd,

                nextMission: {
                    '@IsSilent': false,
                    '#text': 'NONE'
                },

                /*posting: {
                    '@title': info.
                }*/
                email: {
                    sender: info.sender,
                    subject: info.subject,
                    body: info.body,
                }
            }
        }

        let xml = xmlbuilder.create(MissionInfo).end({ prettyPrint: true });

        return xml;
    }
};

function getFields(goalType) {
    switch (goalType) {
        case 1:
        case 3:
            return ['target', 'file', 'path'];
        case 2:
            return ['target', 'path'];
        case 4:
            return ['target', 'file', 'path', 'keyword'];
        case 5:
            return ['target'];
        case 6:
            return ['target'];
        case 7:
            return ['time'];
        case 8:
            return ['target'];
        case 9:
            return ['target', 'file', 'path', 'destTarget', 'destPath', 'decrypt', 'decryptPass'];
        case 10:
            return ['owner', 'degree', 'uni', 'gpa'];
        case 11:
            return ['owner'];
        case 12:
            return ['mailServer', 'recipient', 'subject'];
        case 13:
            return ['target'];
        default:
            console.log(`Unsupported Goal Type ${goalType}`);
            break;
    }
}