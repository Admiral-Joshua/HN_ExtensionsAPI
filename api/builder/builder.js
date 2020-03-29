const router = require("express").Router();
const builder = require("xmlbuilder2");

router.get('/build', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    // Query for Extension Info.
    knex("extension_Info")
        .where({ extensionId: currentExtension })
        .join('extension_Language', { 'extension_Language.langId': 'extension_Info.languageId' })
        .first()
        .then(infoObj => {

            if (infoObj) {

                // Query for starting computers
                knex("ln_Starting_Comp")
                    .join('hn_CompNode', { 'ln_Starting_Comp.nodeId': 'hn_CompNode.nodeId' })
                    .select(knex.raw("array_to_string(array_agg(\"hn_CompNode\".\"id\"), ',') as \"nodeNames\""))
                    .where({ 'ln_Starting_Comp.extensionId': currentExtension })
                    .first()
                    .then(nodes => {
                        var extInfo = {
                            HacknetExtension: {
                                Language: infoObj.lang,
                                Name: infoObj.extensionName,
                                AllowSaves: infoObj.allowSaves,
                                StartingVisibleNodes: nodes.nodeNames,
                                StartingMission: "Missions/Test1.xml"
                            }
                        }

                        let doc = builder.create(extInfo);
                        let xml = doc.end({ prettyPrint: true });

                        res.setHeader('content-type', 'application/xml');
                        res.send(xml);
                    });

            } else {
                res.sendStatus(400);
            }
        });
});

module.exports = router;