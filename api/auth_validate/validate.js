module.exports = function() {
    return (req, res, next) => {
        let knex = req.app.get('db');

        let currentExtension = parseInt(req.cookies.extId);

        // Have we specified an extension first of all?
        if (!isNaN(currentExtension)) {
            // Yes, check that we're allowed to edit
            knex("user_Extension")
                .where({ "extensionId": currentExtension })
                .then(rows => {
                    let userAllowed = false;
                    for (var i = 0; i < rows.length; i++) {
                        let row = rows[i];
                        //console.log(`Extension ID: ${row.extensionId} -> Owned by: ${row.userId}`);
                        if (row.userId === req.user.userId) {
                            userAllowed = true;
                            next();
                            break;
                        }
                    }
                    if (!userAllowed) {
                        res.status(401);
                        res.send("You do not own this Hacknet extension and thus are not allowed to edit it.");
                    }
                })
        } else {
            res.status(400);
            res.send("Extension ID not specified, or invalid.");
        }
    }
}