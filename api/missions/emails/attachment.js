const router = require("express").Router();

// GET
// '/list/:id'
// Retrives list of attachment for the specified email
router.get('/list/:id', (req, res) => {
    let knex = req.app.get('db');

    let emailId = parseInt(req.params.id);

    if (!isNaN(emailId)) {
        knex("ln_attachment_email")
            .join('hn_EmailAttachment', { 'ln_attachment_email.attachmentId': 'hn_EmailAttachment.attachmentId' })
            .join('hn_AttachmentType', { 'hn_AttachmentType.typeId': 'hn_EmailAttachment.typeId' })
            .where({ emailId: emailId })
            .then(rows => {
                res.json(rows);
            })
    } else {
        res.status(400);
        res.send("<h2>Invalid Mission ID or none specified.");
    }
});

// MULTI-OP Request
// '/link/:emailId/:attachmentId'
// Add or removes a link between the specified email and attachment.
router.route('/link/:emailId/:attachmentId')
    .all((req, res, next) => {
        req.emailId = parseInt(req.path.email);
        req.attachmentId = parseInt(req.path.attachment);

        if (!isNaN(req.emailId) && !isNaN(req.attachmentId)) {
            next();
        } else {
            res.status(400);
            res.send(`${isNaN(req.emailId) ? 'Email' : 'Attachment'} ID not specified or is invalid.`);
        }
    })
    .get((req, res) => {
        knex("ln_attachment_email")
            .insert({
                emailId: req.emailId,
                attachmentId: req.attachmentId
            })
            .then(() => {
                res.sendStatus(204);
            });
    })
    .delete((req, res) => {
        knex("ln_attachment_email")
            .update({
                attachmentId: null
            })
            .where({
                emailId: req.emailId,
                attachmentId: req.attachmentId
            })
            .then(() => {
                res.sendStatus(204);
            });
    });

// GET
// '/types/list'
// Retrives list of possible attachment types.
router.get('/types/list', (req, res) => {
    let knex = req.app.get('db');

    knex("hn_AttachmentType")
        .then(rows => {
            res.json(rows);
        });
});

// GET
// '/:id'
// Retrieves information about the attachment with given ID.
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;
    let attachmentId = parseInt(req.params.id);

    if (attachmentId && !isNaN(attachmentId)) {
        knex("hn_EmailAttachment")
            .where({ extensionId: currentExtension, attachmentId: attachmentId })
            .join('hn_AttachmentType', { 'hn_AttachmentType.typeId': 'hn_EmailAttachment.typeId' })
            .first()
            .then(attachment => {
                res.json(attachment);
            });
    }
});

// POST
// '/new'
// Creates new attachment with the specified information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;
    let attachmentInfo = req.body;

    knex("hn_EmailAttachment")
        .insert({
            typeId: attachmentInfo.typeId,
            content: attachmentInfo.content,
            comp: attachmentInfo.comp,
            user: attachmentInfo.user,
            pass: attachmentInfo.pass
        })
        .returning("attachmentId")
        .then(ids => {
            if (ids.length > 0) {
                attachmentInfo.attachmentId = ids[0];
                res.json(attachmentInfo);
            } else {
                res.sendStatus(500);
            }
        });
});

// PUT
// '/:id'
// Updates existing attachment with specified information.
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;
    let attachmentId = parseInt(req.params.id);

    let attachmentInfo = req.body;

    if (attachmentId && !isNaN(attachmentId)) {
        knex("hn_EmailAttachment")
            .update({
                typeId: attachmentInfo.typeId,
                content: attachmentInfo.content,
                comp: attachmentInfo.comp,
                user: attachmentInfo.user,
                pass: attachmentInfo.pass
            })
            .where({ extensionId: currentExtension, attachmentId: attachmentId })
            .then(() => {
                res.json(attachmentInfo);
            })
    }
});

// DELETE
// '/:id'
// Deletes existing attachment with specified information.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let attachmentId = parseInt(req.params.id);

    if (attachmentId && !isNaN(attachmentId)) {
        knex("hn_EmailAttachment")
            .where({ attachmentId: attachmentId })
            .del()
            .then(() => {
                res.sendStatus(204);
            });
    }
});

module.exports = router;
