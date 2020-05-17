const router = require("express").Router();

const validator = require("../../auth_validate/validate")


router.get('/types/list', validator(), (req, res) => {
    let knex = req.app.get('db');

    knex("hn_ConditionType")
        .then(types => {
            res.json(types);
        });
});

router.get('/actions/:id', (req, res) => {
    let knex = req.app.get('db');

    let conditionId = parseInt(req.params.id);

    if (!isNaN(conditionId)) {
        knex("hn_Action")
            .where({ conditionId: conditionId })
            .join("hn_ActionType", { "hn_ActionType.typeId": "hn_Action.typeId" })
            .orderBy("actionId", "desc")
            .then(actions => {
                res.json(actions);
            })
    } else {
        res.status(400);
        res.send("Condition ID not specified or is invalid.");
    }
})

/*router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    let conditionId = parseInt(req.params.id);

    if (!isNaN(conditionId)) {
        knex("hn_ActionCondition")
            .leftJoin("hn_Action", { 'hn_Action.conditionId': 'hn_ActionCondition.conditionId' })
            .where({ 'hn_ActionCondition.conditionId': conditionId })
            .then(results => {
                if (results.length > 0) {
                    let actions = results.map(result => {
                        return {
                            loadActionSetId: result.loadActionSetId,
                            loadMissionId: result.loadMissionId,
                            switchThemeId: result.switchThemeId,
                            fileId: result.fileId,
                            ircMessageId: result.ircMessageId,
                            delayCompId: result.delayCompId,
                            Delay: result.Delay,
                            targetCompId: result.targetCompId,
                            functionId: result.functionId,
                            functionValue: result.functionValue,
                            conditionId: result.conditionId
                        }
                    })
                    result[0].actions = actions;

                    res.json(result[0]);
                } else {
                    res.sendStatus(404);
                }
            })
    } else {
        res.status(400);
        res.send("Condition ID not specified or is invalid.");
    }
})*/

router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let conditionInfo = req.body;

    knex("hn_ActionCondition")
        .insert({
            typeId: conditionInfo.typeId,
            actionSetId: conditionInfo.actionSetId
        })
        .returning("conditionId")
        .then(ids => {
            if (ids.length > 0) {
                conditionInfo.conditionId = ids[0];

                res.json(conditionInfo);
            } else {
                res.sendStatus(500);
            }
        });
})

router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let conditionId = parseInt(req.params.id);

    if (!isNaN(conditionId)) {
        knex("hn_Action")
            .where({ conditionId: conditionId })
            .del()
            .then(() => {
                knex("hn_ActionCondition")
                    .where({ conditionId: conditionId })
                    .del()
                    .then(() => {
                        res.sendStatus(204);
                    })
            })
    } else {
        res.status(400);
        res.send("Condition ID missing or invalid.");
    }

});

module.exports = router;