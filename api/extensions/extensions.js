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
        .select('extension_Info.extensionId', 'extensionName', 'description')
        .where({userId: user.userId})
        .join('extension_Info', {'user_Extension.extensionId' : 'extension_Info.extensionId'})
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
        if (extId && !isNaN(extId)) {

            knex('extension_Info')
                .where({ extensionId: extId })
                .limit(1)
                .then(rows => {
                    if (rows.length >= 1) {
                        res.json(rows);
                    } else {
                        res.status(404);
                        res.send('<h2>404 - Not Found</h2>');
                    }
                });


        } else {
            // 404 - Extension not specified.
            res.status(404);
            res.send('<h2>404 - Not Found</h2>');
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
            res.json(extInfo);
        });
});

// DELETE
// '/:id'
// Deletes the extension with the given ID, ensuring that it is actually owned by the current user first.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let extId = req.params.id;

    if (extId) {
        knex("user_Extension")
            .where('extensionId', extId)
            .select('userId')
            .then(row => {

                // TODO: MY AUTHENTICATED USER ID
                if (row[0].userId === 1) {

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
                }
            });
    } else {
        res.status(404);
        res.send('<h2>404 - Not Found</h2>')
    }
});

module.exports = router;