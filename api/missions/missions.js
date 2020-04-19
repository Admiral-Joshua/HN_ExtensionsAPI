const router = require("express").Router();

// Emails API
// Management and editing of in-game emails.
router.use('/email', require("./emails/email"));

// Posting API
// Management and editing of in-game mission board posts.
router.use('/postings', require("./postings/postings"));

// Goals API
// Management and editing of mission goals.
router.use('/goals', require("./goals/goals"));

// GET
// '/linkEmail?email=<id>&mission=<id>'
// Links the specified email up with the specified mission
router.get('/linkEmail', (req, res) => {
    let knex = req.app.get('db');

    let missionId = parseInt(req.query.mission);
    let emailId = parseInt(req.query.email);

    if (!isNaN(missionId) && !isNaN(emailId)) {
        knex("hn_Mission")
            .update({
                emailId: emailId
            })
            .where({
                missionId: missionId
            })
            .then(() => {
                res.sendStatus(204);
            })
    } else {
        res.status(400);
        res.send(`${isNaN(missionId) ? 'Mission' : 'Email'} ID not specified.`);
    }
});

// GET
// '/linkPosting?posting=<id>&mission=<id>'
// Links the specified posting up with the specified mission
router.get('/linkPosting', (req, res) => {
    let knex = req.app.get('db');

    let missionId = parseInt(req.query.mission);
    let postingId = parseInt(req.query.posting);

    if (!isNaN(missionId) && !isNaN(postingId)) {
        knex("hn_Mission")
            .update({
                postingId: postingId
            })
            .where({
                missionId: missionId
            })
            .then(() => {
                res.sendStatus(204);
            })
            .catch((err) => { // Catch - Error may occur with foriegn key, if the posting specified doesn't exist.
                console.log(err);
            })
    } else {
        res.status(400);
        res.send(`${isNaN(missionId) ? 'Mission' : 'Posting'} ID not specified.`);
    }
});

// GET
// '/list'
// Retrives list of all missions defined in the current Hacknet Extension.
router.get('/list/:id?', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let excludeId = req.params.id;

    let query = knex("hn_Mission")
        .where({ extensionId: currentExtension })
        .orderBy('missionId', 'asc')

    if (!isNaN(excludeId)) {
        query.whereNot({ missionId: excludeId });
    }


    query.then(missions => {
        res.json(missions);
    });
});

// GET
// '/functions/list'
// Retrieve list of possible mission functions Hacknet supports
router.get('/functions/list', (req, res) => {
    let knex = req.app.get('db');

    knex("hn_Function")
        .then(rows => {
            res.json(rows);
        })
})

// GET
// '/:id'
// Retrieves Mission information for mission with the given mission ID.
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    let missionId = parseInt(req.params.id);

    if (missionId && !isNaN(missionId)) {
        knex("hn_Mission")
            .where({ missionId: missionId, extensionId: currentExtension })
            .first()
            .then(mission => {
                if (mission) {
                    res.json(mission);
                } else {
                    res.status(404);
                    res.send("Could not find mission with specified ID.");
                }
            });
    } else {
        res.status(400);
        res.send("Invalid or unspecified Mission ID.");
    }
});

// GET
// '/branch/list/:id'
// Lists mission branches for the given mission ID.
router.get('/branch/list/:id', (req, res) => {
    let knex = req.app.get('db');

    let missionId = parseInt(req.params.id);

    if (missionId) {
        knex("hn_MissionBranch")
            .leftJoin('hn_Mission', { 'hn_Mission.missionId': 'hn_MissionBranch.missionId_2' })
            .where({
                missionId_1: missionId
            })
            .then(results => {
                let branches = results.map(result => {
                    return {
                        branchId: result.branchId,
                        missionOne: result.missionId_1,
                        missionTwo: result.missionId_2,
                        missionName: result.id
                    }
                });

                res.json(branches);
            });
    } else {
        res.status(400);
        res.send("Mission ID was not specified or is invalid.");
    }
})

// POST
// '/branch'
// Creates a branch mission link between two missions.
router.post('/branch', (req, res) => {
    let knex = req.app.get('db');

    //let currentExtension = req.cookies.extId;

    let branchInfo = req.body;

    knex("hn_MissionBranch")
        .insert({
            missionId_1: branchInfo.missionOne,
            missionId_2: branchInfo.missionTwo
        })
        .returning("branchId")
        .then(ids => {
            if (ids.length > 0) {
                branchInfo.branchId = ids[0];
                res.json(branchInfo);
            } else {
                res.sendStatus(500);
            }
        })
});

// DELETE 
// '/branch/:id'
// Deletes mission branch with specified ID.
router.delete('/branch/:id', (req, res) => {
    let knex = req.app.get('db');

    let branchId = parseInt(req.params.id);

    if (!isNaN(branchId)) {
        knex("hn_MissionBranch")
            .where({ branchId: branchId })
            .del()
            .then(() => {
                res.sendStatus(204);
            })
    } else {
        res.status(400);
        res.send("No Branch ID specified or is invalid.");
    }
});

// GET
// '/nextMission?m1=<id>&m2=<id>
// Creates a next mission link between two missions.
router.get('/nextMission', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let missionOne = parseInt(req.query.m1);
    let missionTwo = parseInt(req.query.m2);

    if (missionOne && !isNaN(missionOne) && missionTwo && !isNaN(missionTwo)) {
        knex("hn_Mission")
            .update({
                nextMission: missionTwo,
                extensionId: currentExtension
            })
            .where({ missionId: missionOne })
            .then(() => {
                res.sendStatus(204);
            })
            .catch((err) => { // Catch - Likely, the foreign key constraint failed as specified mission two does not exist.
                // TODO: Proper 404 error when mission two does not exist.
                console.log(err);
            })
    } else {
        res.status(400);
        res.send(`<h2>Mission ${missionOne ? 'Two' : 'One'} not specified, or invalid.`);
    }
});


// POST
// '/new'
// Creates brand new mission file for the current extension with POSTed information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;
    let missionInfo = req.body;

    // TODO: Create Email.
    // TODO: Create Posting.

    knex("hn_Mission")
        .insert({
            extensionId: currentExtension,
            activeCheck: missionInfo.activeCheck,
            id: missionInfo.id,
            shouldIgnoreSenderVerification: missionInfo.shouldIgnoreSenderVerification,
            missionStart: missionInfo.missionStart,
            missionEnd: missionInfo.missionEnd,
            //nextMission: missionInfo.nextMission,
            IsSilent: missionInfo.IsSilent,
            emailId: missionInfo.emailId,
            postingId: missionInfo.postingId
        })
        .returning("missionId")
        .then((ids) => {
            if (ids.length > 0) {
                missionInfo.missionId = ids[0];

                // Create Goal links
                var links = [];
                missionInfo.goals.forEach(goal => {
                    links.push({ missionId: missionInfo.missionId, goalId: goal.goalId });
                });

                knex("ln_Goal_Mission")
                    .insert(links)
                    .then(() => {
                        res.json(missionInfo);
                    })
            } else {
                res.sendStatus(500);
            }
        });
});

// PUT
// '/:id'
// Updates mission whose ID matches the one specified, with POSTed information.
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;
    let missionInfo = req.body;

    let missionId = parseInt(req.params.id);

    if (missionId && !isNaN(missionId)) {
        // Delete existing Goal Links first.
        knex("ln_Goal_Mission")
            .where({ missionId: missionId })
            .del()
            .then(() => {
                // Update mission info.
                knex("hn_Mission")
                    .update({
                        id: missionInfo.id,
                        activeCheck: missionInfo.activeCheck,
                        shouldIgnoreSenderVerification: missionInfo.shouldIgnoreSenderVerification,
                        missionStart: missionInfo.missionStart,
                        missionEnd: missionInfo.missionEnd,
                        IsSilent: missionInfo.IsSilent,
                        emailId: missionInfo.emailId,
                        postingId: missionInfo.postingId,
                        nextMission: missionInfo.nextMission
                    })
                    .where({ missionId: missionId, extensionId: currentExtension })
                    .then(() => {

                        // Re-add Goal Links
                        var links = [];
                        missionInfo.goals.forEach(goal => {
                            links.push({ missionId: missionId, goalId: goal.goalId })
                        });

                        knex("ln_Goal_Mission")
                            .insert(links)
                            .then(() => {
                                res.json(missionInfo);
                            })
                    });
            })

    } else {
        res.status(400);
        res.send("Invalid or unspecified Mission ID.");
    }
});

// DELETE
// '/:id'
// Deletes mission whose ID matches the one specified.
// Cascades to delete email, posting and goals.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    let missionId = parseInt(req.params.id);

    if (missionId && !isNaN(missionId)) {
        knex("hn_Mission")
            .where({ missionId: missionId, extensionId: currentExtension })
            .first()
            .then(missionInfo => {

                // Delete all goal links
                knex("ln_Goal_Mission")
                    .where({ missionId: missionId })
                    .then(() => {

                        // Does this mission have an email link?
                        if (missionInfo.emailId && missionInfo.emailId > 0) {
                            knex("hn_Email")
                                .where({ emailId: missionInfo.emailId })
                                .del()
                                .then(() => {

                                    // Does this mission have a board posting link?
                                    if (missionInfo.postingId && missionInfo.postingId > 0) {
                                        knex("hn_BoardPost")
                                            .where({ postingId: missionInfo.postingId })
                                            .del()
                                            .then(() => {

                                                // Now delete the actual mission
                                                knex("hn_Mission")
                                                    .where({ missionId: missionId, extensionId: currentExtension })
                                                    .del()
                                                    .then(() => {
                                                        res.sendStatus(204);
                                                    });
                                            });
                                    }
                                });
                        }
                    });
            });
    } else {
        res.status(400);
        res.send("Invalid or unspecified Mission ID.");
    }
});


module.exports = router;