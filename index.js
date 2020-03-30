// Import dependencies
const express = require("express");
const knex = require("knex");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const jwt = require("express-jwt");
const fs = require("fs");
const cookieParser = require("cookie-parser");

// Import back-end API code.
const API = require("./api/api");

// Load up config files
// Application Configuration
const config = require("./config.json");

// Initialise SQL-Builder with Database Details.
const db = knex({
    client: "pg",
    connection: `postgres://${config.db.user}:${config.db.pass}@${config.db.host}:${config.db.port}/${config.db.schema}`
});

// Initialise user_data directory
fs.exists(`${__dirname}/user_data`, (exists) => {
    if (!exists) {
        fs.mkdir(`${__dirname}/user_data`);
    }
});

const app = express();

// Push SQL-Builder to app so it can be utilised throughout the project.
app.set('db', db);
app.set('path', `${__dirname}`);

// Parse POST body data.
app.use(bodyParser());

// Parse Cookie Data from the client
app.use(cookieParser());

// Parse file uploads
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
}));

// Authorization - Don't let non-authenticated users work on extensions.
app.use(jwt({
    secret: config.security.secret
}))

// App Handler in the event the user has not yet authenticated
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // TODO: Redirect to Lunasphere login page.
        res.status(401);
        res.send("<h2>Not currently logged in, or credentials have expired.</h2>");
    }
})

// Setup API url.
app.use('/api', API);

// Start the server.
let port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`HN Extensions API -- Started @0.0.0.0:${port}`)
});