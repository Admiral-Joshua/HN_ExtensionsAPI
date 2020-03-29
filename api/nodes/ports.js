const router = require("express").Router();

// GET
// '/all'
// Retrieves list of all available ports.
router.get('/all', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    knex("hn_Ports")
        .then(rows => {
            res.json(rows);
        });
});

// GET
// '/list/:id'
// Retrieves list of ports plus any remaps for a computer node with given ID.
router.get('/list/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    let nodeId = parseInt(req.params.id);

    if (nodeId && !isNaN(nodeId)) {
        knex("ln_Comp_Ports")
            .where({ "nodeId": nodeId })
            .join('hn_Ports', { 'ln_Comp_Ports.portId': 'hn_Ports.portId' })
            .then(rows => {

                let result = {
                    ports: rows
                };

                knex("hn_PortRemap")
                    .where({ 'nodeId': nodeId })
                    .then(remaps => {
                        result.remaps = remaps;
                        res.json(result);
                    });

            });
    } else {
        res.status(400);
        res.send("Node ID not specified, or was invalid.");
    }
});

// GET
// '/map?node=id&port=id
// Maps the given port up to the given computer node.
router.get('/map', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let portId = parseInt(req.query.port);
    let nodeId = parseInt(req.query.node);

    if (portId && nodeId) {
        // DO STUFF
        knex("ln_Comp_Ports")
            .insert({ nodeId: nodeId, portId: portId })
            .then(() => {
                res.sendStatus(204);
            })
            .catch((err) => {
                res.sendStatus(500);
                console.log(err);
            });
    } else {
        res.status(400);
        res.send(`<h2>No ${!portId ? 'PortID' : 'NodeID'} specified.</h2>`);
    }
});

// GET
// '/unmap?node=id&port=id
// Unmaps the given port from the given NodeId.
router.get('/unmap', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let portId = parseInt(req.query.port);
    let nodeId = parseInt(req.query.node);

    if (portId && !isNaN(portId) && nodeId && !isNaN(nodeId)) {
        knex("ln_Comp_Ports")
            .where({ nodeId: nodeId, portId: portId })
            .del()
            .then(() => {
                res.sendStatus(204);
            })
            .catch(err => {
                res.sendStatus(500);
                console.log(err);
            });
    } else {
        res.status(400);
        res.send(`<h2>No ${!portId ? 'PortID' : 'NodeID'} specified.</h2>`);
    }
});

module.exports = router;