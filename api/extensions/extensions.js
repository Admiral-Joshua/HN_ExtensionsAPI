const router = require("express").Router();

router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    if (knex !== null) {
        let extId = req.params.id;

        // Check an extension was specified.
        if (extId) {

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