// Import dependencies
const express = require("express");
const knex = require("knex");
const bodyParser = require("body-parser");
const jwt = require("express-jwt");

// Import back-end API code.
const API = require("./api/api");

// Load up config files
// DB Config
const dbConf = require("./conf/dbconn.json");
// Security Configuration
const conf = require("./conf/security.json");

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

// Authorization - Don't let non-authenticated users work on extensions.
app.use(jwt({
    secret: conf.authSecret
}))

// App Handler in the event the user has not yet authenticated
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // TODO: Redirect to Lunasphere login page.
        res.status(401);
        res.send("<h2>Unauthorised</h2>");
    }
})

// Setup API url.
app.use('/api', API);

// Start the server.
let port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`HN Extensions API -- Started @0.0.0.0:${port}`)
});