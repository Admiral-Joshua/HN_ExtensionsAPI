const router = require("express").Router();
const secValidator = require("./auth_validate/validate");

const extensionsAPI = require("./extensions/extensions");

// Extensions Router
// Used for fetching and manipulating extension info
router.use('/extensions', extensionsAPI);

// SECURITY MIDDLEWARE -> Blocks access to other RESTful endpoints
//  until an Extension has been selected and that the currently authenticated
//  user is allowed to access the selected extension.
/*router.use((req, res, next) => {
    let knex = req.app.get('db');
    let user = req.user;

    let extensionId = parseInt(req.cookies.extId);

    if (!isNaN(extensionId)) {
        
    } else {
        // NO EXTENSION ID SPECIFIED
        // Cannot continue
        // TODO: Redirect to home page?
        res.status(400);
        res.send("No Extension ID specified, or invalid.");
    }
});*/

// Themes API
// For creation and modification of custom themes
router.use('/themes', require("./themes/themes"));

// Music API
// For uploading, selecting and playing music tracks for an extension.
router.use('/music', require("./music/music"));

// Nodes API
// Management and editing of Computer Nodes for an extension.
router.use('/nodes', secValidator(), require("./nodes/nodes"));

// Missions API
// Management and editing of Mission files for an extension.
router.use('/missions', secValidator(), require("./missions/missions"));


module.exports = router;