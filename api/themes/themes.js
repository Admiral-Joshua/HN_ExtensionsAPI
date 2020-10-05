const path = require("path");
const router = require("express").Router();
const fs = require("fs");

// Layouts API
router.use('/layouts', require("./layout/layout"));

// GET
// '/list/:id'
// Retrieves list of themes for the extension currently being edited.
router.get('/list', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    if (!isNaN(currentExtension)) {

        knex("hn_Theme")
            .join("hn_ThemeLayout", { "hn_Theme.layoutId": "hn_ThemeLayout.layoutId" })
            .where({ extensionId: currentExtension })
            .then(rows => {
                res.json(rows);
            })
    } else {
        res.status(400);
        res.send("Extension ID not specified or is invalid.");
    }
});

// GET
// '/:id'
// Retrieves detailed information for the theme matching the given ID
router.get('/:id', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;
    let themeId = parseInt(req.params.id);

    if (!isNaN(themeId)) {
        knex("hn_Theme")
            .where({ themeId: themeId, extensionId: currentExtension })
            .first()
            .then(theme => {
                if (theme) {
                    res.json(theme);
                } else {
                    res.status(404);
                    res.send("Theme with that ID could not be found.");
                }
            })
    } else {
        res.status(400);
        res.send("Theme ID not specified or is invalid.");
    }
});

// POST
// '/upload'
// Uploads a new background image for the specified theme
router.post('/upload', (req, res) => {
    let user = req.user;
    let root = req.app.get('path');
    let themeInfo = req.body;
    let themeImage = req.files.bgimage;

    // Check if user directory exists.
    //var PATH = `${root}\\user_data\\${user.userId}`;
    var PATH = path.join(root, 'user_data', user.userId.toString());
    if (!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH);
    }

    // Check if extension directory exists.
    PATH = path.join(PATH, themeInfo.extensionId.toString(), 'Themes');
    if (!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH, { recursive: true });
    }

    let fileExt = /\.(?:[a-z]|[0-9]){1,3}$/.exec(themeImage.name);
    // Proceed to move the uploaded audio file into the user's directory.
    let dest = path.join(PATH, themeInfo.themeId.toString() + fileExt);
    themeImage.mv(dest, (err) => {
        if (err) { res.sendStatus(500); return; }
        res.sendStatus(204);
    });
});

// GET
// '/:themeId/bgimage'
// Retrieves background image for the requested theme (if available)
router.get('/:themeId/bgimage', (req, res) => {
    let knex = req.app.get('db');
    let user = req.user;
    let themeId = req.params.themeId;
    let root = req.app.get('path');

    knex("hn_Theme")
        .where({ themeId: themeId })
        .first()
        .then((theme) => {
            if (theme) {
                var PATH = path.join(root, 'user_data', user.userId.toString(), theme.extensionId.toString(), 'Themes', theme.themeId.toString() + ".png");

                if (fs.existsSync(PATH)) {
                    res.sendFile(PATH);
                } else {
                    //res.sendStatus(404);
                    res.sendFile(path.join(root, 'user_data', '0', 'Themes', 'hacknet_dlc_purple.png'));
                }
            } else {
                res.sendFile(path.join(root, 'user_data', '0', 'Themes', 'hacknet_dlc_purple.png'));
            }
        });
});

// POST
// '/new'
// Creates a new theme under the current hacknet extension.
router.post('/new', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;

    let themeInfo = req.body;

    // TODO: Validate Theme data.

    // TODO: Validate ID is not duplicate.

    knex("hn_Theme")
        .insert({
            extensionId: currentExtension,
            id: themeInfo.id,
            layoutId: themeInfo.layoutId,
            BackgroundImagePath: themeInfo.BackgroundImagePath,
            defaultHighlightColor: themeInfo.defaultHighlightColor,
            defaultTopBarColor: themeInfo.defaultTopBarColor,
            moduleColorSolidDefault: themeInfo.moduleColorSolidDefault,
            moduleColorStrong: themeInfo.moduleColorStrong,
            moduleColorBacking: themeInfo.moduleColorBacking,
            exeModuleTopBar: themeInfo.exeModuleTopBar,
            exeModuleTitleText: themeInfo.exeModuleTitleText,
            warningColor: themeInfo.warningColor,
            subtleTextColor: themeInfo.subtleTextColor,
            darkBackgroundColor: themeInfo.darkBackgroundColor,
            indentBackgroundColor: themeInfo.indentBackgroundColor,
            outlineColor: themeInfo.outlineColor,
            lockedColor: themeInfo.lockedColor,
            brightLockedColor: themeInfo.brightLockedColor,
            brightUnlockedColor: themeInfo.brightUnlockedColor,
            unlockedColor: themeInfo.unlockedColor,
            lightGray: themeInfo.lightGray,
            shellColor: themeInfo.shellColor,
            shellButtonColor: themeInfo.shellButtonColor,
            semiTransText: themeInfo.semiTransText,
            terminalTextColor: themeInfo.terminalTextColor,
            topBarTextColor: themeInfo.topBarTextColor,
            superLightWhite: themeInfo.superLightWhite,
            connectedNodeHighlight: themeInfo.connectedNodeHighlight,
            netmapToolTipColor: themeInfo.netmapToolTipColor,
            netmapToolTipBackground: themeInfo.netmapToolTipBackground,
            topBarIconsColor: themeInfo.topBarIconsColor,
            thisComputerNode: themeInfo.thisComputerNode,
            scanlinesColor: themeInfo.scanlinesColor
        })
        .returning("themeId")
        .then(ids => {
            if (ids.length < 1) {
                res.sendStatus(500);
            } else {
                themeInfo.themeId = ids[0];

                res.json(themeInfo);
            }
        });
})

// PUT
// '/:id'
// Updates the information for the theme with matching ID.
router.put('/:id', (req, res) => {
    let knex = req.app.get('db');

    let themeId = parseInt(req.params.id);
    let currentExtension = req.cookies.extId;

    let themeInfo = req.body;

    if (!isNaN(themeId)) {

        knex("hn_Theme")
            .update({
                id: themeInfo.id,
                layoutId: themeInfo.layoutId,
                BackgroundImagePath: themeInfo.BackgroundImagePath,
                defaultHighlightColor: themeInfo.defaultHighlightColor,
                defaultTopBarColor: themeInfo.defaultTopBarColor,
                moduleColorSolidDefault: themeInfo.moduleColorSolidDefault,
                moduleColorStrong: themeInfo.moduleColorStrong,
                moduleColorBacking: themeInfo.moduleColorBacking,
                exeModuleTopBar: themeInfo.exeModuleTopBar,
                exeModuleTitleText: themeInfo.exeModuleTitleText,
                warningColor: themeInfo.warningColor,
                subtleTextColor: themeInfo.subtleTextColor,
                darkBackgroundColor: themeInfo.darkBackgroundColor,
                indentBackgroundColor: themeInfo.indentBackgroundColor,
                outlineColor: themeInfo.outlineColor,
                lockedColor: themeInfo.lockedColor,
                brightLockedColor: themeInfo.brightLockedColor,
                brightUnlockedColor: themeInfo.brightUnlockedColor,
                unlockedColor: themeInfo.unlockedColor,
                lightGray: themeInfo.lightGray,
                shellColor: themeInfo.shellColor,
                shellButtonColor: themeInfo.shellButtonColor,
                semiTransText: themeInfo.semiTransText,
                terminalTextColor: themeInfo.terminalTextColor,
                topBarTextColor: themeInfo.topBarTextColor,
                superLightWhite: themeInfo.superLightWhite,
                connectedNodeHighlight: themeInfo.connectedNodeHighlight,
                netmapToolTipColor: themeInfo.netmapToolTipColor,
                netmapToolTipBackground: themeInfo.netmapToolTipBackground,
                topBarIconsColor: themeInfo.topBarIconsColor,
                thisComputerNode: themeInfo.thisComputerNode,
                scanlinesColor: themeInfo.scanlinesColor
            })
            .where({ themeId: themeId, extensionId: currentExtension })
            .then(() => {
                res.json(themeInfo);
            })

    } else {
        res.status(400);
        res.send("Theme ID not specified or is invalid.");
    }
});

// DELETE
// '/:id'
// Deletes Theme matching the specified ID.
router.delete('/:id', (req, res) => {
    let knex = req.app.get('db');

    let currentExtension = req.cookies.extId;
    let themeId = parseInt(req.params.id);

    if (!isNaN(themeId)) {
        knex("hn_Theme")
            .where({ themeId: themeId, extensionId: currentExtension })
            .del()
            .then(() => {
                res.sendStatus(204);
            })

    } else {
        res.status(400);
        res.send("Theme ID not specified or invalid.");
    }
});

module.exports = router;