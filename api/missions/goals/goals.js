const router = require("express").Router();

// GET
// '/types/list'
// Retrieves list of all possible goal types.
router.get('/types/list', (req, res) => {
    let knex = req.app.get('db');

    knex("hn_MGoalType")
        .then(rows => {
            res.json(rows);
        });
});

// GET
// '/list/:id'
// Retrieves a list of all goals currently set for the mission with specified ID.
router.get('/list/:id', (req, res) => {
    let knex = req.app.get('db');

    let missionId = parseInt(req.params.id);

    if (!isNaN(missionId)) {
        knex('ln_Goal_Mission')
            .select('hn_MissionGoal.goalId', 'hn_MGoalType.typeId', 'hn_MGoalType.typeText', 'file', 'path', 'keyword', 'removal', 'caseSensitive', 'owner', 'degree', 'uni', 'gpa', 'mailServer', 'recipient', 'subject')
            .join('hn_MissionGoal', { 'ln_Goal_Mission.goalId': 'hn_MissionGoal.goalId' })
            .join('hn_MGoalType', { 'hn_MissionGoal.typeId': 'hn_MGoalType.typeId' })
            .where({ missionId: missionId })
            .then(rows => {
                res.json(rows);
            });
    } else {
        res.status(400);
        res.send("<h2>Mission ID not specified or invalid.</h2>");
    }
});

// POST
// '/new'
// Create new Mission Goal with specified information
router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let goalInfo = req.body;

    let targetMission = parseInt(req.body.missionId);

    if (!isNaN(targetMission)) {

        knex("hn_MissionGoal")
            .insert({
                typeId: goalInfo.typeId,
                file: goalInfo.file,
                path: goalInfo.path,
                keyword: goalInfo.keyword,
                removal: goalInfo.removal,
                caseSensitive: goalInfo.caseSensitive,
                owner: goalInfo.owner,
                degree: goalInfo.degree,
                uni: goalInfo.uni,
                gpa: goalInfo.gpa,
                mailServer: goalInfo.mailServer,
                recipient: goalInfo.recipient,
                subject: goalInfo.subject
            })
            .returning("goalId")
            .then(ids => {
                if (ids.length > 0) {
                    goalInfo.goalId = ids[0];

                    knex("ln_Goal_Mission")
                        .insert({
                            missionId: targetMission,
                            goalId: goalInfo.goalId
                        })
                        .then(() => {
                            res.json(goalInfo);
                        });
                } else {
                    res.sendStatus(500);
                }
            });
    } else {
        res.status(400);
        res.send("<h2>No Mission ID specified. Must have an Mission ID to link the goal to.</h2>")
    }
});

// PUT
// '/:id'
// Updates existing goal with uploaded information and specified ID.
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');

    let goalId = parseInt(req.params.id);
    let goalInfo = req.body;

    if (!isNaN(goalId)) {
        knex("hn_MissionGoal")
            .update({
                typeId: goalInfo.typeId,
                file: goalInfo.file,
                path: goalInfo.path,
                keyword: goalInfo.keyword,
                removal: goalInfo.removal,
                caseSensitive: goalInfo.caseSensitive,
                owner: goalInfo.owner,
                degree: goalInfo.degree,
                uni: goalInfo.uni,
                gpa: goalInfo.gpa,
                mailServer: goalInfo.mailServer,
                recipient: goalInfo.recipient,
                subject: goalInfo.subject
            })
            .where({
                goalId: goalId
            })
            .then(() => {
                res.json(goalInfo)
            })
    } else {
        res.status(400);
        res.send("<h2>Goal ID not specified or invalid.</h2>")
    }
})

// DELETE
// '/:id'
// Delete goal with specified ID.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let goalId = parseInt(req.params.id);

    if (!isNaN(goalId)) {
        // Delete this goal from any missions that reference it.
        knex("ln_Goal_Mission")
            .where({ goalId: goalId })
            .del()
            .then(() => {
                knex("hn_MissionGoal")
                    .where({ goalId: goalId })
                    .del()
                    .then(() => {
                        res.sendStatus(204);
                    });
            });
    } else {
        res.status(400);
        res.send("<h2>Goal ID not specified or invalid.</h2>");
    }
});

module.exports = router;