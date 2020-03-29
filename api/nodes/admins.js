const router = require("express").Router();

// GET
// '/admins/list'
// Retrieves list of all admins currently defined within this extension.
router.get('/list', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    knex("hn_Admin")
        .where({ extensionId: currentExtension })
        .join('hn_AdminType', { 'hn_Admin.adminTypeId': 'hn_AdminType.adminTypeId' })
        .then(rows => {
            res.json(rows);
        });
});

//GET
// '/admins/types/list'
// Retrieves list of admin types available
router.get('/types/list', (req, res) => {
    let knex = req.app.get('db');

    knex("hn_AdminType")
        .then(rows => {
            res.json(rows);
        });
});

// POST
// '/admins/new'
// Create a new admin with the specified information.
router.post('/new', (req, res) => {
    let knex = req.app.get('knex');
    let user = req.user;

    let currentExtension = req.cookies.extId;

    let adminInfo = req.body;

    adminInfo.extensionId = currentExtension;

    knex("hn_Admin")
        .insert(adminInfo)
        .returning("adminInfoId")
        .then((ids) => {
            if (ids.length > 0) {
                adminInfo.adminId = ids[0];
                res.json(adminInfo);
            } else {
                res.sendStatus(500);
            }
        }).catch(err => {
            res.sendStatus(500);
        });
});

module.exports = router;