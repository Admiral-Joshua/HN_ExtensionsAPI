const router = require("express").Router();

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
            console.log(ids);
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

// GET
// 'map?node=id&file=id
// Maps a file with the given ID, to a node with given id.
router.get('/map', (req, res) => {
    let knex = req.app.get('db');

    let nodeId = parseInt(req.query.node);
    let fileId = parseInt(req.query.file);

    if (nodeId && !isNaN(nodeId) && fileId && !isNaN(fileId)) {
        knex("ln_Comp_File")
            .insert({ nodeId: nodeId, fileId: fileId })
            .then(() => {
                res.sendStatus(204);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.status(400);
        res.send(`Missing ${!nodeId ? 'NodeID' : 'FileID'} for link to be created.`);
    }
});

// GET
// 'unmap?node=id&file=id
// Removes mapping between file with specified ID, and node with specified ID.
router.get('/unmap', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;

    let nodeId = parseInt(req.query.node);
    let fileId = parseInt(req.query.file);

    if (nodeId && !isNaN(nodeId) && fileId && !isNaN(fileId)) {
        knex("ln_Comp_File")
            .where({ nodeId: nodeId, fileId: fileId })
            .del();
    } else {
        res.status(400);
        res.send(`Missing ${!nodeId ? 'NodeID' : 'FileID'} for link to be created.`);
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

        // Start by deleting all links to this file...
        knex("ln_Comp_File")
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
    } else {
        res.status(400);
        res.send("No File ID specified, or invalid.")
    }
});

module.exports = router;