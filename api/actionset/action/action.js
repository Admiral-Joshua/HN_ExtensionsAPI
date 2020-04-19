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

    let actionSetId = parseInt(req.cookies.id);

    if (!isNaN(actionSetId)) {
        knex("LN_action_set")
            .where({ actionSetId: actionSetId })
            .join('hn_Action', { 'hn_Action.actionId': 'ln_action_set.actionId' })
            .then(actions => {
                res.json(actions);
            });
    } else {
        res.status(400);
        res.send("Action Set ID not specified or invalid.");
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
            actionTypeId: actionInfo.actionTypeId,
            requirementId: actionInfo.requirementId,
            loadActionId: actionInfo.loadActionId,
            loadMissionId: actionInfo.loadMissionId,
            switchThemeId: actionInfo.switchThemeId,
            fileId: actionInfo.fileId,
            ircMessageId: actionInfo.ircMessageId,
            delayCompId: actionInfo.delayCompId,
            Delay: actionInfo.Delay,
            targetCompId: actionInfo.targetCompId,
            functionId: actionInfo.functionId,
            functionValue: actionInfo.functionValue
        })
        .returning("actionId")
        .then(ids => {
            if (ids.length > 0) {
                actionInfo.actionId = ids[0];
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
                actionTypeId: actionInfo.actionTypeId,
                requirementId: actionInfo.requirementId,
                loadActionId: actionInfo.loadActionId,
                loadMissionId: actionInfo.loadMissionId,
                switchThemeId: actionInfo.switchThemeId,
                fileId: actionInfo.fileId,
                ircMessageId: actionInfo.ircMessageId,
                delayCompId: actionInfo.delayCompId,
                Delay: actionInfo.Delay,
                targetCompId: actionInfo.targetCompId,
                functionId: actionInfo.functionId,
                functionValue: actionInfo.functionValue
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
        knex("LN_action_set")
            .where({ actionId: actionId })
            .del()
            .then(() => {
                knex("hn_Action")
                    .where({ actionId: actionId })
                    .del()
                    .then(() => {
                        res.sendStatus(204);
                    });
            });
    } else {
        res.status(400);
        res.send("<h2>Action ID not specified, or is invalid.");
    }
});

module.exports = router;