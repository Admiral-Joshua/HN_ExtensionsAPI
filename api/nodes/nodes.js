const router = require("express").Router();


router.use('/admins', require("./admins"));
router.use('/files', require("./files"));
router.use('/ports', require("./ports"));
router.use('/dlinks', require("./dlinks"));

// GET
// '/list'
// Lists all defined Computers for the currently being edited Hacknet Extension.
router.get('/list', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    if (currentExtension) {
        knex("hn_CompNode")
            .select('hn_CompNode.nodeId', 'id', 'name', 'ip', 'securityLevel', 'portsForCrack', 'traceTime', 'icon', 'portType')
            .where({ extensionId: currentExtension })
            .leftJoin('ln_Comp_Ports', { 'hn_CompNode.nodeId': 'ln_Comp_Ports.nodeId' })
            .leftJoin('hn_Ports', { 'hn_Ports.portId': 'ln_Comp_Ports.portId' })
            .then(rows => {
                let comps = new Map();

                rows.forEach(node => {
                    if (comps.has(node.nodeId)) {
                        comps.get(node.nodeId).ports.push(node.portType);
                    } else {
                        let comp = node;
                        comp.ports = [node.portType];

                        comps.set(node.nodeId, comp);
                    }

                });
                res.json([...comps.values()]);
            })

        return;
    }

    res.sendStatus(400);
})

// GET
// '/:id'
// Retreives detailed information about the computer with given ID.
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let extensionId = req.cookies.extId;
    let nodeId = parseInt(req.params.id);

    if (nodeId && !isNaN(nodeId)) {
        knex("hn_CompNode")
            .select('hn_CompNode.nodeId', 'id', 'name', 'ip', 'securityLevel', 'typeId', knex.raw('COALESCE("allowsDefaultBootModule", false) as "allowsDefaultBootModule"'), 'icon', 'adminPass', 'portsForCrack', 'traceTime', 'adminInfoId', 'tracker')

        .where({ 'nodeId': nodeId })
            .first()
            .then(nodeInfo => {

                if (nodeInfo) {
                    // Retrieve Port information for this PC.
                    knex("ln_Comp_Ports")
                        .select('hn_Ports.*')
                        .where({ nodeId: nodeInfo.nodeId })
                        .join('hn_Ports', { 'hn_Ports.portId': 'ln_Comp_Ports.portId' })
                        .then(ports => {
                            nodeInfo.ports = ports;

                            // Retrive File information for this PC.
                            knex("ln_Comp_File")
                                .where({ nodeId: nodeInfo.nodeId })
                                .join('hn_CompFile', { 'ln_Comp_File.fileId': 'hn_CompFile.fileId' })
                                .then(files => {
                                    nodeInfo.files = files;

                                    res.json(nodeInfo);
                                });
                        });
                } else {
                    res.status(404);
                    res.send("Computer Node does not exist.")
                }

            });
    } else {
        res.sendStatus(400);
    }

});

// POST
// '/new'
// Create new Computer Node with the specified information
router.post('/new', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    let nodeInfo = req.body;

    // Check this id is unique first before proceeding

    knex("hn_CompNode")
        .where({ extensionId: currentExtension, id: nodeInfo.id })
        .then(rows => {
            if (rows.length !== 0) {
                res.status(400);
                res.send("The ID of the computer must be unique within this extension.");
            } else {
                knex("hn_CompNode")
                    .insert({
                        extensionId: currentExtension,
                        id: nodeInfo.id,
                        name: nodeInfo.name,
                        ip: nodeInfo.ip,
                        securityLevel: nodeInfo.securityLevel,
                        allowsDefaultBootModule: nodeInfo.allowsDefaultBootModule,
                        icon: nodeInfo.icon,
                        typeId: nodeInfo.typeId,
                        adminPass: nodeInfo.adminPass,
                        portsForCrack: nodeInfo.portsForCrack,
                        traceTime: nodeInfo.traceTime,
                        adminInfoId: nodeInfo.adminInfoId,
                        tracker: nodeInfo.tracker
                    })
                    .returning("nodeId")
                    .then(ids => {
                        if (ids.length > 0) {
                            nodeInfo.nodeId = ids[0];

                            // Create port links
                            var portLinks = [];
                            nodeInfo.ports.forEach(port => {
                                portLinks.push({ nodeId: nodeInfo.nodeId, portId: port.portId });
                            });

                            // Create file links
                            var fileLinks = [];
                            nodeInfo.files.forEach(file => {
                                fileLinks.push({ nodeId: nodeInfo.nodeId, fileId: file.fileId });
                            });

                            knex("ln_Comp_Ports")
                                .insert(portLinks)
                                .then(() => {

                                    knex("ln_Comp_File")
                                        .insert(fileLinks)
                                        .then(() => {
                                            res.json(nodeInfo);
                                        });
                                });

                        } else {
                            res.sendStatus(500);
                        }
                    });
            }
        });
});

// PUT
// '/:id'
// Updates existing Computer Node with the specified information
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    let nodeId = parseInt(req.params.id);
    let nodeInfo = req.body;

    if (!isNaN(nodeId)) {
        // UPDATE the other information
        knex("hn_CompNode")
            .update({
                id: nodeInfo.id,
                name: nodeInfo.name,
                ip: nodeInfo.ip,
                securityLevel: nodeInfo.securityLevel,
                allowsDefaultBootModule: nodeInfo.allowsDefaultBootModule,
                icon: nodeInfo.icon,
                typeId: nodeInfo.typeId,
                adminPass: nodeInfo.adminPass,
                portsForCrack: nodeInfo.portsForCrack,
                traceTime: nodeInfo.traceTime,
                adminInfoId: nodeInfo.adminInfoId,
                tracker: nodeInfo.tracker
            })
            .where({ nodeId: nodeId })
            .then(() => {
                res.json(nodeInfo);
            });
    } else {
        res.status(400);
        res.send("Node ID was not specified or was invalid.")
    }
});

module.exports = router;