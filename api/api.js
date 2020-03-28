const router = require("express").Router();

const extensionsAPI = require("./extensions/extensions");
const musicAPI = require("./music/music");
const nodesAPI = require("./nodes/nodes");

router.use('/extensions', extensionsAPI);
router.use('/music', musicAPI);
router.use('/nodes', nodesAPI);

module.exports = router;