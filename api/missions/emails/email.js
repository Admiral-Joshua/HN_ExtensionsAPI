const router = require("express").Router();

// Attachments API
// Used for management editing of attachments for an email.
router.use('/attachments', require("./attachments"));

// GET
// '/:id'
// Fetches email information with the specified ID.
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extensionId;

    let emailId = parseInt(req.params.id);

    if (emailId && !isNaN(emailId)) {
        knex("hn_Email")
            .where({ emailId: emailId, extensionId: currentExtension })
            .first()
            .then(email => {
                if (email) {
                    res.json(email);
                } else {
                    res.status(404);
                    res.send("<h2>Email with that ID could not be found.");
                }
            })
    }
});

// POST
// '/new'
// Create a new email with the specified information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extensionId;
    let emailInfo = req.body;

    knex("hn_Email")
        .insert({
            sender: emailInfo.sender,
            subject: emailInfo.subject,
            body: emailInfo.body
        })
        .returning('emailId')
        .then(ids => {
            if (ids.length > 0) {
                emailInfo.emailId = ids[0];
                res.json(emailInfo);
            } else {
                res.sendStatus(500);
            }
        });
})

// PUT
// '/:id'
// Updates existing email with POSTed information, identifying by specified ID.
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extensionId;
    let emailInfo = req.body;

    let emailId = parseInt(req.params.id);

    if (emailId && !isNaN(emailId)) {
        knex("hn_Email")
            .update({
                sender: emailInfo.sender,
                subject: emailInfo.subject,
                body: emailInfo.body
            })
            .where({ missionId: missionId, extensionId: currentExtension })
            .then(() => {
                res.json(emailInfo);
            });
    }
});

// DELETE
// '/:id'
// Deletes an email with specified ID.
// Cascades through to Missions, removing all references to the email on missions.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extensionId;

    let emailId = parseInt(req.params.id);

    if (emailId && !isNaN(emailId)) {

        knex("hn_Mission")
            .update({
                emailId: null
            })
            .where({ emailId: emailId, extensionId: currentExtension })
            .then(() => {
                knex("hn_Email")
                    .where({ emailId: emailId, extensionId: currentExtension })
                    .del()
                    .then(() => {
                        res.sendStatus(204);
                    });
            });
    }
})

module.exports = router;