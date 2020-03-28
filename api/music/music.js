const router = require("express").Router();

// GET 
// '/list'
// Fetches a list of music tracks available for the currently logged in user.
router.get('/list', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    knex("hn_Music")
        .where({ownerId: 0})
        .orWhere({ownerId: user.userId})
        .then(rows => {
            res.json(rows);
        });
});

// POST
// '/new'
// Uploads a new Music Track to the server, under the current user.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let trackInfo = req.body;
    let trackFile = req.files.track;

    // TODO: Validate Track Info.

    knex("hn_Music")
        .insert({ownerId: user.userId, title: trackInfo.title})
        .returning("musicId")
        .then(ids => {
            trackInfo.musicId = ids[0];
            res.json(trackInfo);

            // TODO: Transfer the music data to a user folder.
            // E.g. trackFile.mv(<TARGET_PATH>)
        });
});

// POST
// '/:id'
// Fetches Track information for the specified track.
router.post('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let trackInfo = req.body;
    let musicId = req.params.id;

    if (musicId) {

        // Check music exists, (and you own it)
        knex("hn_Music")
            .where({ownerId: user.userId, musicId: req.params.id})
            .first()
            .then(row => {
                // If track exists and you own it
                if (row) {
                    // Proceed with the rename.
                    knex("hn_Music")
                        .where({ownerId: user.userId, musicId: req.params.id})
                        .update({title: trackInfo.title})
                        .then(() => {
                            // UPDATE SUCCESS - Return updated record.
                            res.json(trackInfo);
                        });

                    // Return - so as not to continue to return 404
                    return;
                }
                // ELSE: It doesn't exist, or it isn't yours!!
            })
    }
    res.sendStatus(404);
});

// DELETE
// '/:id'
// Delete the music track at the specified ID, ensuring that this only deletes when owned by the current user.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let trackId = req.params.id;

    if (trackId) {
        knex("hn_Music")
            .where({ownerId: user.userId, musicId: trackId})
            .del()
            .then(() => {
                res.sendStatus(204); //success - empty response.
            });
    } else {
        res.status(400);
        res.send("<h2>No TrackID specified to delete.</h2>");
    }
});

module.exports = router;