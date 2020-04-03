const router = require("express").Router();

router.use('/action', require("./action/action"));

// GET
// '/:id'
// Retrieve an action set and it's associated actions
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let actionSetId = parseInt(req.params.id);

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
                })

        });
});

// POST
// '/new'
// Create brand new Action Set with uploaded information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    knex("hn_ActionSet")
        .insert({
            name: actionSetInfo
        })
        .returning("actionSetId")
        .then(ids => {
            if (ids.length > 0) {
                actionSetInfo.actionSetId = ids[0];
                res.json(actionSetInfo);
            } else {
                res.sendStatus(500);
            }
        });
});

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