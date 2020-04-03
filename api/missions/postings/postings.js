const router = require("express").Router();

// GET
// '/:id'
// Retrive posting with specified ID.
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    let postingId = parseInt(req.params.id);

    if (!isNaN(postingId)) {
        knex("hn_BoardPost")
            .where({ postingId: postingId })
            .first()
            .then(post => {
                if (post) {
                    res.json(post);
                } else {
                    res.status(404);
                    res.send("Post could not be found.")
                }
            })
    } else {
        res.status(400);
        res.send("Posting ID not specified, or was invalid.");
    }
});

// POST
// '/new'
// Creates new post with specified information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let postingId = parseInt(req.params.id);
    let postInfo = req.body;

    if (!isNaN(postingId)) {
        knex("hn_BoardPost")
            .insert({
                title: postInfo.title,
                reqs: postInfo.reqs,
                requiredRank: postInfo.requiredRank,
                content: postInfo.content
            })
            .returning("postingId")
            .then((ids) => {
                if (ids.length > 0) {
                    postInfo.postingId = ids[0];
                } else {
                    res.sendStatus(500);
                }
            })
    } else {
        res.status(400);
        res.send("Posting ID not specified, or was invalid.");
    }
});

// PUT
// '/:id'
// Updates existing post with specified information.
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');

    let postingId = parseInt(req.params.id);
    let postInfo = req.body;

    if (!isNaN(postingId)) {
        knex("hn_BoardPost")
            .update({
                title: postInfo.title,
                reqs: postInfo.reqs,
                requiredRank: postInfo.requiredRank,
                content: postInfo.content
            })
            .where({ postingId: postingId })
            .then(() => {
                res.json(postInfo);
            });
    } else {
        res.status(400);
        res.send("Posting ID not specified, or was invalid.");
    }
});

// DELETE
// '/:id'
// Delete existing post with the specified ID.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let postingId = parseInt(req.params.id);

    if (!isNaN(postingId)) {
        knex("hn_BoardPost")
            .where({ postingId: postingId })
            .del()
            .then(() => {
                res.sendStatus(204);
            });
    } else {
        res.status(400);
        res.send("Posting ID not specified, or was invalid.");
    }
});

module.exports = router;