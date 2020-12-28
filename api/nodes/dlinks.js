const router = require("express").Router();

// MULTI-OPERATION
// '/link/:nodeId/:otherNodeId'
// Creates or removes a link between two nodes within the Extension.
router.route('/link/:nodeId/:otherNodeId')
    .all((req, res, next) => {
        req.srcNodeId = parseInt(req.path.nodeId);
        req.destNodeId = parseInt(req.path.otherNodeId);

        if (!isNaN(req.srcNodeId) && !isNaN(req.destNodeId)) {
            next();
        } else {
            res.status(400);
            res.send(`${isNaN(req.srcNodeId) ? 'Source' : 'Dest'} ID is missing or is invalid.`);
        }
    })
    .get((req, res) => {
        let knex = req.app.get('db');

        knex("ln_Comp_Dlink")
            .insert({
                srcNodeId: req.srcNodeId,
                destNodeId: req.destNodeId
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
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("ln_Comp_Dlink")
            .where({
                srcNodeId: req.srcNodeId,
                destNodeId: req.destNodeId
            })
            .del()
            .then(() => {
                res.sendStatus(204);
            });
    });

module.exports = router;
