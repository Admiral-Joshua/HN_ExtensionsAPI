const router = require("express").Router();

const validator = require("../../auth_validate/validate");

router.get('/list', validator(), (req, res) => {
    let knex = req.app.get('db');

    knex("hn_ThemeLayout")
        .then(layouts => {
            res.json(layouts);
        })
});

module.exports = router;