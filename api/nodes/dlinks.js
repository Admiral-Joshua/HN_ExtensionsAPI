const router = require("express").Router();

// GET
// '/list/:id'
// Retrieves a list of all dlinks for the given node.
router.get('/list/:id', (req, res) => {
    let knex = req.app.get('db');

    let nodeId = parseInt(req.params.id);

    if (!isNaN(nodeId)) {
        knex("ln_Comp_Dlink")
            .where({
                srcNodeId: nodeId
            })
            .join('hn_CompNode', { 'hn_CompNode.nodeId': 'ln_Comp_Dlink.srcNodeId' })
            .then(rows => {
                res.json(rows);
            })
    } else {
        res.status(400);
        res.send("Node ID not specified or invalid.");
    }
});

// GET
// '/link?node=<id>&dest=<id>
// Creates a DLINK between the specified node and destination.
router.get('/link', (req, res) => {
    let knex = req.app.get('db');

    let srcNodeId = parseInt(req.query.node);
    let destNodeId = parseInt(req.query.dest);

    if (!isNaN(srcNodeId) && !isNaN(destNodeId)) {
        knex("ln_Comp_Dlink")
            .insert({
                srcNodeId: srcNodeId,
                destNodeId: destNodeId
            })
            .then(() => {
                res.sendStatus(204);
            })
            .catch((err) => {
                if (err.code === "23505") {
                    // Link already exists, ignore.
                    res.sendStatus(204);
                } else {
                    // Something more serious occurred.
                    res.sendStatus(500);
                    console.error(err.message); //res.send(err.message);
                }
            })
    } else {
        res.status(400);
        res.send(`${isNaN(srcNodeId) ? 'Source' : 'Dest'} ID is missing or is invalid.`);
    }
});

// GET
// '/unlink?node=<id>&dest=<id>
// Removes a DLINK between the specified node and destination (if exists)
router.get('/unlink', (req, res) => {
    let knex = req.app.get('db');

    let srcNodeId = parseInt(req.query.node);
    let destNodeId = parseInt(req.query.dest);

    if (!isNaN(srcNodeId) && !isNaN(destNodeId)) {
        knex("ln_Comp_Dlink")
            .where({
                srcNodeId: srcNodeId,
                destNodeId: destNodeId
            })
            .del()
            .then(() => {
                res.sendStatus(204);
            });
    } else {
        res.status(400);
        res.send(`${isNaN(srcNodeId) ? 'Source' : 'Dest'} ID is missing or is invalid.`);
    }
});

module.exports = router;