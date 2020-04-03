const router = require("express").Router();

// GET
// '/languages'
// Retrieves a list of possible Extension Languages currently supported by Hacknet.
router.get('/languages', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    knex("extension_Language")
        .then(rows => {
            res.json(rows);
        });
});

// GET
// '/list'
// Retrieves a list of extensions that you have created.
router.get('/list', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    knex("user_Extension")
        .select('extension_Info.extensionId', 'extensionName', 'description', 'extension_Language.Language')
        .join('extension_Info', { 'user_Extension.extensionId': 'extension_Info.extensionId' })
        .join("extension_Language", { 'extension_Language.langId': 'extension_Info.languageId' })
        .where({ userId: user.userId })
        .then(rows => {
            res.json(rows);
        });
});

// GET
// '/:id'
// Retrieves extension information for extension with the given ID.
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    if (knex !== null) {
        let extId = parseInt(req.params.id);

        // Check an extension was specified.
        if (!isNaN(extId)) {

            knex('extension_Info')
                .where({ extensionId: extId })
                .first()
                .then(info => {
                    if (info) {
                        res.json(info);
                    } else {
                        res.status(404);
                        res.send('Extension with that ID could not be found.');
                    }
                });
        } else {
            // 404 - Extension not specified.
            res.status(400);
            res.send('Extension ID not specified or is invalid.');
        }
    }
});

// POST
// '/new'
// Creates a brand new extension under the current user, with the POSTed information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let extInfo = req.body;

    //TODO: perform validation

    // DB Insert
    knex
        .insert(extInfo)
        .returning("extensionId")
        .into("extension_Info")
        .then(ids => {
            extInfo.extensionId = ids[0];

            // Add link to this user.
            knex("user_Extension")
                .insert({
                    extensionId: extInfo.extensionId,
                    userId: req.user.userId
                })
                .then(() => {
                    res.json(extInfo);
                });
        });
});


// TODO: Don't allow users to update or delete Extensions that they do not own.

// PUT
// '/:id'
// Updates extension matching ID with specified information
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');

    let extInfo = req.body;

    let extensionId = parseInt(req.params.id);

    if (!isNaN(extensionId)) {
        knex("extension_Info")
            .where({ extensionId: extensionId })
            .update({
                "extensionName": extInfo.extensionName,
                "languageId": extInfo.languageId,
                "allowSaves": extInfo.allowSaves,
                "description": extInfo.description,
                "startingThemeId": extInfo.startingThemeId,
                "startingMusic": extInfo.startingMusic,
                "startingMissionId": extInfo.startingMissionId,
                "workshop_description": extInfo.workshop_description,
                "workshop_language": extInfo.workshop_language,
                "workshop_visibility": extInfo.workshop_visibility,
                "workshop_tags": extInfo.workshop_tags,
                "workshop_img": extInfo.workshop_img,
                "workshop_id": extInfo.workshop_id
            })
            .then(() => {
                res.json(extInfo);
            })
    }
})

// DELETE
// '/:id'
// Deletes the extension with the given ID, ensuring that it is actually owned by the current user first.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let extId = parseInt(req.params.id);

    if (!isNaN(extId)) {
        knex("user_Extension")
            .where('extensionId', extId)
            .select('userId')
            .then(row => {

                // TODO: MY AUTHENTICATED USER ID
                if (row[0].userId === req.user.userId) {

                    knex("user_Extension")
                        .del()
                        .where('extensionId', extId)
                        .then(() => {
                            knex
                                .del()
                                .from('extension_Info')
                                .where('extensionId', extId)
                                .then(() => {
                                    res.sendStatus(204);
                                });
                        });
                } else {
                    res.status(401);
                    res.send("This is not your Extension, and thus you cannot delete it.");
                }
            });
    } else {
        res.status(400);
        res.send('Extension ID not specified or invalid.');
    }
});

module.exports = router;