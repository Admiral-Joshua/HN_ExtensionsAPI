// Import dependencies
const express = require("express");
const knex = require("knex");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");

var whitelist = ['http://dev.lunasphere.co.uk', 'http://dev.lunasphere.co.uk:4200']
var corsOptions = {
    origin: 'http://dev.lunasphere.co.uk:4200',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

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
        fs.mkdir(`${__dirname}/user_data`, () => {
            // Log to console.
            console.log(`Directory '/user_data' created.`);
        });
    }
});

const app = express();

// Static Routing for Angular v9 Front-end Application
app.use(express.static(`${__dirname}/app`));

// Allow some CORS
//app.options('*', cors()) // include before other routes
app.use(cors(corsOptions));

// Push SQL-Builder to app so it can be utilised throughout the project.
app.set('db', db);
app.set('path', `${__dirname}`);

// Parse POST body data.6
app.use(bodyParser.urlencoded({ extended: true }));

// Parse Cookie Data from the client
app.use(cookieParser());

// Parse file uploads
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
}));

// App Handler in the event the user has not yet authenticated
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // TODO: Redirect to Lunasphere login page.
        res.status(401);
        res.send("Not currently logged in, or credentials have expired.");
    } else if (err.message === "Not allowed by CORS") {
        res.status(401);
        res.send("Source address is forbidden access by CORS.");
    }
});

// Setup API url.
app.use('/api', API);

// Start the server.
let port = process.env.PORT || 80;
app.listen(port, '0.0.0.0', () => {
    console.log(`HN Extensions API -- Started @0.0.0.0:${port}`)
});

//module.exports = app;