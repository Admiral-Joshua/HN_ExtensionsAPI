const router = require("express").Router();

router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    if (knex !== null) {
        let extId = req.params.id;

        // Check an extension was specified.
        if (extId) {

            knex('extension_Info')
                .where({extensionId: extId})
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

module.exports = router;