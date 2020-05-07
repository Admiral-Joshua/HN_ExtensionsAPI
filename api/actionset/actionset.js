const router = require("express").Router();

router.use('/action', require("./action/action"));

// GET
// '/list'
// Retrieves a summary of action sets for the current extension
router.get('/summary', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = parseInt(req.cookies.extId);

    knex("hn_ActionSet")
        .select('hn_ActionSet.actionSetId', 'hn_ActionSet.name', knex.raw('COUNT("hn_Action"."actionId") as count'))
        .join("LN_action_set", { "LN_action_set.actionSetId": "hn_ActionSet.actionSetId" })
        .join("hn_Action", { "hn_Action.actionId": "LN_action_set.actionId" })
        .where({
            'hn_ActionSet.extensionId': currentExtension
        })
        .groupBy('hn_ActionSet.actionSetId')
        .then(rows => {
            res.json(rows);
        })

});

// GET
// '/:id'
// Retrieve an action set and it's associated actions
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let actionSetId = parseInt(req.params.id);


    if (!isNaN(actionSetId)) {

        knex("hn_ActionSet")
            .where({ actionSetId: actionSetId })
            .first()
            .then(actionSetInfo => {
                // Query for actions..

                knex("LN_action_set")
                    .select('hn_Action.*')
                    .where({ actionSetId: actionSetId })
                    .join('hn_Action', { 'LN_action_set.actionId': 'hn_Action.actionId' })
                    .then(actions => {
                        actionSetInfo.actions = actions;

                        res.json(actionSetInfo);
                    })

            });
    } else {
        res.status(400);
        res.send("Action Set ID not specified, or invalid.");
    }
});

// POST
// '/new'
// Create brand new Action Set with uploaded information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let actionSetInfo = req.body;
    let actions = req.body.actions;

    knex("hn_ActionSet")
        .insert({
            name: actionSetInfo.name,
            extensionId: currentExtension
        })
        .returning("actionSetId")
        .then(ids => {
            if (ids.length > 0) {
                actionSetInfo.actionSetId = ids[0];

                // Create links to actions
                let links = actions.map(action => {
                    return { actionId: action.actionId, actionSetId: ids[0] };
                });
                knex("LN_action_set")
                    .insert(links)
                    .then(() => {
                        res.json(actionSetInfo);
                    })
            } else {
                res.sendStatus(500);
            }
        });
});

// PUT
// '/:id'
// Updates action set with specified information, and corresponding links to actions
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');

    let actionSetId = parseInt(req.params.id);

    let actionSetInfo = req.body;
    let actions = req.body.actions;

    if (!isNaN(actionSetId)) {
        knex("hn_ActionSet")
            .update({
                name: actionSetInfo
            })
            .where({
                actionSetId: actionSetId
            })
            .then(() => {

                // Clear all links to existing Actions
                knex("LN_action_set")
                    .where({
                        actionSetId: actionSetId
                    })
                    .del()
                    .then(() => {

                        // Recreate links for what is left.
                        let reqLinks = actions.map(action => {
                            return { actionSetId: actionSetId, actionId: action.actionId }
                        });

                        knex("LN_action_set")
                            .insert(reqLinks)
                            .then(() => {
                                res.json(actionSetInfo);
                            })
                    })
            })
    } else {
        res.status(400);
        res.send("Action Set ID not specified or invalid.");
    }
})

// DELETE
// '/:id'
// Deletes the action set matching the given ID.
// Cascades to all actions inside this action set.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let actionSetId = parseInt(req.params.id);

    if (!isNaN(actionSetId)) {

        // Delete all requirements that this action set contained.
        knex("LN_action_reqs")
            .select("requirementId")
            .where({ actionSetId: actionSetId })
            .then(ids => {
                knex("hn_ActionRequirement")
                    .whereIn({ requirementId: ids })
                    .del(() => {

                        // Delete all links to this action set
                        knex("LN_action_set")
                            .where({ actionSetId: actionSetId })
                            .del()
                            .then(() => {
                                knex("hn_ActionSet")
                                    .where({ actionSetId: actionSetId })
                                    .del(() => {
                                        res.sendStatus(204);
                                    });
                            });
                    });
            })
            .del();
    } else {
        res.status(400);
        res.send("Action Set ID not specified or invalid.");
    }
});

module.exports = router;