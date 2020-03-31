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

    let missionId = parseInt(req.params.mission);
    let emailId = parseInt(req.params.email);

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
        res.send(`<h2>${isNaN(missionId) ? 'Mission' : 'Email'} ID not specified.</h2>`);
    }
});

// GET
// '/linkPosting?posting=<id>&mission=<id>'
// Links the specified posting up with the specified mission
router.get('/linkPosting', (req, res) => {
    let knex = req.app.get('db');

    let missionId = parseInt(req.params.mission);
    let postingId = parseInt(req.params.posting);

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
        res.send(`<h2>${isNaN(missionId) ? 'Mission' : 'Posting'} ID not specified.</h2>`);
    }
});

// GET
// '/list'
// Retrives list of all missions defined in the current Hacknet Extension.
router.get('/list', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    knex("hn_Mission")
        .where({ extensionId: currentExtension })
        .then(missions => {
            res.json(missions);
        });
});

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
                    res.send("<h2>Could not find mission with specified ID.</h2>");
                }
            });
    } else {
        res.status(400);
        res.send("<h2>Invalid or unspecified Mission ID.</h2>");
    }
});

// POST
// '/branch'
// Creates a branch mission link between two missions.
router.post('/branch', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let branchInfo = req.body;

    knex("hn_MissionBranch")
        .insert({
            missionId_1: missionOne,
            missionId_2: missionTwo
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
                res.json(missionInfo);
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
        knex("hn_Mission")
            .update({
                activeCheck: missionInfo.activeCheck,
                shouldIgnoreSenderVerification: missionInfo.shouldIgnoreSenderVerification,
                missionStart: missionInfo.missionStart,
                missionEnd: missionInfo.missionEnd,
                IsSilent: missionInfo.IsSilent,
                emailId: missionInfo.emailId,
                postingId: missionInfo.postingId
            })
            .where({ missionId: missionId, extensionId: currentExtension })
            .then(() => {
                res.json(missionInfo);
            });
    } else {
        res.status(400);
        res.send("<h2>Invalid or unspecified Mission ID.</h2>");
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
        res.send("<h2>Invalid or unspecified Mission ID.</h2>");
    }
});


module.exports = router;