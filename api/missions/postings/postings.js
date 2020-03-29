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
                    res.send("<h2>Post could not be found.</h2>")
                }
            })
    } else {
        res.status(400);
        res.send("<h2>Posting ID not specified, or was invalid.</h2>");
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
        res.send("<h2>Posting ID not specified, or was invalid.</h2>");
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
        res.send("<h2>Posting ID not specified, or was invalid.</h2>");
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
        res.send("<h2>Posting ID not specified, or was invalid.</h2>");
    }
});

module.exports = router;