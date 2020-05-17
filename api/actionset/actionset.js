const router = require("express").Router();

router.use('/action', require("./action/action"));

router.use('/condition', require("./action/condition"));

// GET
// '/list'
// Retrieves a summary of action sets for the current extension
/*router.get('/summary', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = parseInt(req.cookies.extId);

    knex("hn_ActionSet")
        .select('hn_ActionSet.actionSetId', 'hn_ActionSet.name', knex.raw('COUNT("LN_action_set"."actionId") as count'))
        .leftJoin("LN_action_set", { "LN_action_set.actionSetId": "hn_ActionSet.actionSetId" })
        .where({
            'hn_ActionSet.extensionId': currentExtension
        })
        .groupBy('hn_ActionSet.actionSetId')
        .then(rows => {
            res.json(rows);
        })

});*/

// GET
// '/list'
// Retrieves list of action sets defined in the current extension
router.get('/list', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    knex("hn_ActionSet")
        .where({ extensionId: currentExtension })
        .then(actionsets => {
            res.json(actionsets);
        })
})

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
                // Query for conditions and their subsequent actions
                knex("hn_ActionCondition")
                    .where({ actionSetId: actionSetId })
                    .join("hn_ConditionType", { 'hn_ConditionType.typeId': "hn_ActionCondition.typeId" })
                    .then(conditions => {

                        if (conditions.length > 0) {
                            let conditionIds = [];

                            conditions.forEach(condition => {
                                conditionIds.push(condition.conditionId);

                                condition.actions = [];
                            });

                            knex("hn_Action")
                                .whereIn('conditionId', conditionIds)
                                .leftJoin('hn_ActionType', { 'hn_ActionType.typeId': 'hn_Action.typeId' })
                                .then(actions => {
                                    actions.forEach(action => {
                                        let idx = conditions.findIndex(condition => condition.conditionId === action.conditionId);
                                        if (idx > -1) {
                                            conditions[idx].actions.push(action);
                                        }
                                    });

                                    actionSetInfo.conditions = conditions;

                                    res.json(actionSetInfo);
                                })

                        } else {
                            actionSetInfo.conditions = conditions;

                            res.json(actionSetInfo);
                        }
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

                knex("hn_ConditionType")
                    .where({ typeText: 'Instantly' })
                    .first()
                    .then(type => {
                        // Create Instantly default condition for this action set.
                        knex("hn_ActionCondition")
                            .insert({
                                typeId: type.typeId,
                                needsMissionComplete: false,
                                actionSetId: actionSetInfo.actionSetId
                            })
                            .returning("conditionId")
                            .then(ids => {
                                if (ids.length > 0) {
                                    actionSetInfo.conditions.push({
                                        conditionId: ids[0],
                                        typeId: type.typeId,
                                        typeText: "Instantly",
                                        actionSetId: actionSetInfo.actionSetId
                                    })

                                    res.json(actionSetInfo);
                                }
                            })
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

    if (!isNaN(actionSetId)) {

        knex.transaction(trx => {
            const queries = actionSetInfo.conditions.map(condition => {
                return knex('hn_ActionCondition')
                    .where({ conditionId: condition.conditionId })
                    .update({
                        needsMissionComplete: condition.needsMissionComplete,
                        requiredFlags: condition.requiredFlags,
                        targetNodeId: condition.targetNodeId
                    })
                    .transacting(trx);
            });

            Promise.all(queries)
                .then(() => {
                    trx.commit();
                    res.json(actionSetInfo);
                })
                .catch(trx.rollback);
        });
    } else {
        res.status(400);
        res.send("Action Set ID not specified or invalid.");
    }
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

        // Get a list of all conditions for this action set
        knex("hn_ActionCondition")
            .where({ actionSetId: actionSetId })
            .then(conditions => {
                let ids = conditions.map(condition => condition.conditionId);

                knex("hn_Action")
                    .whereIn("conditionId", ids)
                    .del()
                    .then(() => {
                        knex("hn_ActionCondition")
                            .where({ actionSetId: actionSetId })
                            .del()
                            .then(() => {
                                // Finally - delete action set
                                knex("hn_ActionSet")
                                    .where({ actionSetId: actionSetId })
                                    .del()
                                    .then(() => {
                                        res.sendStatus(204);
                                    })
                            })
                    })
            })

    } else {
        res.status(400);
        res.send("Action Set ID not specified or invalid.");
    }
});

module.exports = router;