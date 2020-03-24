// Import dependencies
const express = require("express");
const knex = require("knex");
const bodyParser = require("body-parser");

// Import back-end API code.
const API = require("./api/api");

// Load up config file for Database.
const dbConf = require("./conf/dbconn.json");

// Initialise SQL-Builder with Database Details.
const db = knex({
    client: "pg",
    connection: `postgres://${dbConf.user}:${dbConf.pass}@${dbConf.host}:${dbConf.port}/${dbConf.schema}`
});

const app = express();

// Push SQL-Builder to app so it can be utilised throughout the project.
app.set('db', db);

// Parse POST body data.
app.use(bodyParser());

// Setup API url.
app.use('/api', API);

// Start the server.
let port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`HN Extensions API -- Started @0.0.0.0:${port}`)
});