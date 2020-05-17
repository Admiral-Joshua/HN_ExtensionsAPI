const router = require("express").Router();

// GET
// '/types/list'
// Retrieves list of available action types
router.get('/types/list', (req, res) => {
    let knex = req.app.get('db');

    knex("hn_ActionType")
        .then(types => {
            res.json(types);
        })
})

// GET
// '/list'
// Retrieves list of Actions for the given action set
router.get('/list/:id', (req, res) => {
    let knex = req.app.get('db');

    let actionSetId = parseInt(req.params.id);

    if (!isNaN(actionSetId)) {
        knex("LN_action_set")
            .where({ actionSetId: actionSetId })
            .join('hn_Action', { 'hn_Action.actionId': 'LN_action_set.actionId' })
            .then(actions => {
                res.json(actions);
            });
    } else {
        res.status(400);
        res.send("Action Set ID not specified or invalid.");
    }
});

// GET
// '/:id'
// Fetches an action that matches the given ActionId
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    let actionId = parseInt(req.params.id);

    if (!isNaN(actionId)) {
        knex("hn_Action")
            .where({ actionId: actionId })
            .first()
            .then(actionInfo => {
                if (actionInfo) {
                    res.json(actionInfo);
                } else {
                    res.status(404);
                    res.send("Action matching that ID could not be found.");
                }
            })
    } else {
        res.status(400);
        res.send("Action ID not specified or invalid.");
    }
});

// POST
// '/new'
// Create new action with uploaded information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let actionInfo = req.body;

    knex("hn_Action")
        .insert({
            loadActionSetId: actionInfo.loadActionSetId > 0 ? actionInfo.loadActionSetId : undefined,
            loadMissionId: actionInfo.loadMissionId > 0 ? actionInfo.loadMissionId : undefined,
            switchThemeId: actionInfo.switchThemeId > 0 ? actionInfo.switchThemeId : undefined,
            fileId: actionInfo.fileId > 0 ? actionInfo.fileId : undefined,
            ircMessageId: actionInfo.ircMessageId > 0 ? actionInfo.ircMessageId : undefined,
            delayCompId: actionInfo.delayCompId > 0 ? actionInfo.delayCompId : undefined,
            Delay: actionInfo.Delay > 0 ? actionInfo.Delay : undefined,
            targetCompId: actionInfo.targetCompId > 0 ? actionInfo.targetCompId : undefined,
            functionId: actionInfo.functionId > 0 ? actionInfo.functionId : undefined,
            functionValue: actionInfo.functionValue > 0 ? actionInfo.functionValue : undefined,
            conditionId: actionInfo.conditionId > 0 ? actionInfo.conditionId : undefined,
            typeId: actionInfo.typeId
        })
        .returning("actionId")
        .then(ids => {
            if (ids.length > 0) {
                actionInfo.actionId = ids[0];

                res.json(actionInfo);
            } else {
                res.sendStatus(500);
            }
        });
})

// PUT
// '/:id'
// Update exising action with uploaded information.
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let actionInfo = req.body;
    let actionId = parseInt(req.params.id);

    if (!isNaN(actionId)) {
        knex("hn_Action")
            .update({
                // requirementId: actionInfo.requirementId,
                loadActionSetId: actionInfo.loadActionSetId,
                loadMissionId: actionInfo.loadMissionId,
                switchThemeId: actionInfo.switchThemeId,
                fileId: actionInfo.fileId,
                ircMessageId: actionInfo.ircMessageId,
                delayCompId: actionInfo.delayCompId,
                Delay: actionInfo.Delay,
                targetCompId: actionInfo.targetCompId,
                functionId: actionInfo.functionId,
                functionValue: actionInfo.functionValue,
                conditionId: actionInfo.conditionId
            })
            .where({ actionId: actionId })
            .then(() => {
                res.json(actionInfo);
            });
    } else {
        res.status(400);
        res.send("Action ID not specified or invalid.");
    }
});

// DELETE
// '/:id'
// Delete action and any references to it.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let actionId = parseInt(req.params.id);

    if (!isNaN(actionId)) {
        knex("hn_Action")
            .where({ actionId: actionId })
            .del()
            .then(() => {
                res.sendStatus(204);
            });
    } else {
        res.status(400);
        res.send("<h2>Action ID not specified, or is invalid.");
    }
});

module.exports = router;