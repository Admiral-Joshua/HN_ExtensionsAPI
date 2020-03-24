const router = require("express").Router();

const extensionsAPI = require("./extensions/extensions");

router.use('/extensions', extensionsAPI);

module.exports = router;