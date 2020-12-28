const router = require("express").Router();

// GET
// '/list/all'
// Retrieves a list of all files in the current extension.
router.get('/list/all', (req, res) => {
    let knex = req.app.get('db');

    let extensionId = parseInt(req.cookies.extId);

    if (!isNaN(extensionId)) {
        knex("hn_CompFile")
            .where({ extensionId: extensionId })
            .then(files => {
                res.json(files);
            })
    } else {
        res.status(400);
        res.send("Extension ID not specified or invalid.");
    }
})

// GET
// '/templates/list'
// Retrieve a list of possible file templates available for file creation,
router.get('/templates/list', (req, res) => {
    let knex = req.app.get('db');

    knex("hn_FileTemplate")
        .then(templates => {
            res.json(templates);
        })
})

// GET
// '/list/:id'
// Retrives a list of all files defined for the given computer.
router.get('/list/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let extensionId = req.cookies.extId;
    let nodeId = parseInt(req.params.id);

    if (nodeId && !isNaN(nodeId)) {
        knex("ln_Comp_File")
            .where({ 'nodeId': nodeId })
            .join('hn_CompFile', { 'ln_Comp_File.fileId': 'hn_CompFile.fileId' })
            .then(files => {
                res.json(files);
            });
    } else {
        res.sendStatus(400);
    }
});


// MULTI-OPERATION
// 'link?node=id&file=id
// Creates or removes a link between an existing file and node
router.route('/link/:nodeId/:fileId')
    .all((req, res, next) => {
        // Validate first...
        req.nodeId = parseInt(req.path.nodeId);
        req.fileId = parseInt(req.path.fileId);

        if (!isNaN(req.nodeId) && !isNaN(req.fileId)) {
            next();
        } else {
            res.status(500).send(`Missing ${!isNaN(req.nodeId) ? 'NodeID' : 'FileID'} for link to be created.`);
        }
    })
    .get((req, res) => {
        let knex = req.app.get('db');

            knex("ln_Comp_File")
                .where({ nodeId: req.nodeId, fileId: req.fileId })
                .first()
                .then(row => {
                    if (row) {
                        res.sendStatus(204);
                    } else {
                        knex("ln_Comp_File")
                            .insert({
                                nodeId: req.nodeId,
                                fileId: req.fileId
                            })
                            .then(() => {
                                res.sendStatus(204);
                            });
                    }
                })

    })
    .delete((req, res) => {
        let knex = req.app.get('db');
        let user = req.user;

        knex("ln_Comp_File")
            .where({ nodeId: req.nodeId, fileId: req.fileId })
            .del();
    });

// GET
// '/:id'
// Retrieves information about the specified file
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    let fileId = parseInt(req.params.id);

    if (!isNaN(fileId)) {
        knex("hn_CompFile")
            .where({ fileId: fileId })
            .first()
            .then(file => {
                if (file) {
                    res.json(file);
                } else {
                    res.status(404);
                    res.send("File with ID not found.");
                }
            })
    } else {
        res.status(400);
        res.send("File ID not specified or is invalid.");
    }
})

// POST
// '/new'
// Creates a new file under the current hacknet extension with specified information.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;
    let fileInfo = req.body;

    knex("hn_CompFile")
        .insert({
            extensionId: currentExtension,
            path: fileInfo.path,
            name: fileInfo.name,
            contents: fileInfo.contents
        })
        .returning("fileId")
        .then((ids) => {
            if (ids.length > 0) {
                fileInfo.fileId = ids[0];
                res.json(fileInfo);
            } else {
                res.sendStatus(500);
            }
        });
});

// PUT
// '/:id'
// Updates the file with specified ID, with the POSTed new information
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let currentExtension = req.cookies.extId;
    let fileId = req.params.id;
    let fileInfo = req.body;

    if (fileId && !isNaN(fileId)) {
        knex("hn_CompFile")
            .update({
                path: fileInfo.path,
                name: fileInfo.name,
                contents: fileInfo.contents
            })
            .where({
                fileId: fileId,
                extensionId: currentExtension
            })
            .then(() => {
                res.json(fileInfo);
            });
    }
});

// DELETE
// '/:id'
// Deletes the file with given ID. Cascades to links, removing any references to the file in computer nodes.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let fileId = parseInt(req.params.id);

    let currentExtension = req.cookies.extId;

    if (currentExtension && fileId && !isNaN(fileId)) {

        // Delete any computers that might hold this file.
        knex("ln_Comp_File")
            .where({ fileId: fileId })
            .del()
            .then(() => {
                // Delete any actions that might reference this file.
                knex("hn_Action")
                    .where({ fileId: fileId })
                    .del()
                    .then(() => {
                        knex("hn_CompFile")
                            .where({ fileId: fileId, extensionId: currentExtension })
                            .del()
                            .then(() => {
                                res.sendStatus(204);
                            });
                    });
            });
    } else {
        res.status(400);
        res.send("No File ID specified, or invalid.")
    }
});

module.exports = router;
