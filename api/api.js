const router = require("express").Router();

const extensionsAPI = require("./extensions/extensions");

// Extensions Router
// Used for fetching and manipulating extension info
router.use('/extensions', extensionsAPI);

// SECURITY MIDDLEWARE -> Blocks access to other RESTful endpoints
//  until an Extension has been selected and that the currently authenticated
//  user is allowed to access the selected extension.
router.use((req, res, next) => {
    let knex = req.app.get('db');
    let user = req.user;

    let extensionId = parseInt(req.cookies.extId);

    if (extensionId) {
        knex("user_Extension")
            .where({ "extensionId": extensionId })
            .then(rows => {
                let userAllowed = false;
                for (var i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    //console.log(`Extension ID: ${row.extensionId} -> Owned by: ${row.userId}`);
                    if (row.userId === user.userId) {
                        userAllowed = true;
                        next();
                        break;
                    }
                }
                if (!userAllowed) {
                    res.status(401);
                    res.send("<h2>You do not own this Hacknet extension and thus are not allowed to edit it.</h2>");
                }
            })
    } else {
        // NO EXTENSION ID SPECIFIED
        // Cannot continue
        // TODO: Redirect to home page?
        res.sendStatus(400);
    }
});

// Music API
// For uploading, selecting and playing music tracks for an extension.
router.use('/music', require("./music/music"));

// Nodes API
// Management and editing of Computer Nodes for an extension.
router.use('/nodes', require("./nodes/nodes"));

// Missions API
// Management and editing of Mission files for an extension.
router.use('/missions', require("./missions/missions"));


module.exports = router;