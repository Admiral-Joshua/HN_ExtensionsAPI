const router = require("express").Router();

// GET
// '/list'
// Lists all defined Computers for the currently being edited Hacknet Extension.
router.get('/list', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    if (currentExtension) {
        knex("hn_CompNode")
            .select('nodeId', 'id', 'name', 'ip', 'typeText')
            .where({extensionId: currentExtension})
            .join('hn_CompType', {'hn_CompNode.typeId': 'hn_CompType.typeId'})
            .then(rows => {
                res.json(rows);
            });

        return;
    }

    res.sendStatus(400);
})

// GET
// '/:id'
// Fetches detailed information for the node with given ID.
//  Will also check what Extension Id the user is editing to preent tampering other people's extensions.
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let targetNodeId = req.params.id;
    let currentExtension = req.cookies.extId;
    
    if (currentExtension && targetNodeId) {

        knex("hn_CompNode")
            .where({nodeId: targetNodeId, extensionId: currentExtension})
            .first()
            .then(row => {
                if (row)
                    res.json(row);
                else
                    res.sendStatus(404);
            });

        return;
    }

    res.sendStatus(400);
});



module.exports = router;