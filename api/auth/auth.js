const crypto = require("crypto");

const router = require("express").Router();

const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"@";

const jwt = require("jsonwebtoken");
const secret = require(`${__dirname}/../../config.json`).security.secret;

function randomInt(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function generateSalt() {

    let salt = "";

    while (salt.length < 12) {
        salt += chars[randomInt(0, chars.length)];
    }

    return salt;
}


router.post('/login', (req, res) => {
    let knex = req.app.get('db');

    let userDetails = req.body;

    knex("luna_Users")
        .where({ username: userDetails.username })
        .first()
        .then(user => {

            if (!user) {
                res.status(401);
                res.send("User account could not be found.");
            } else {

                let hashedPassword = crypto.createHmac('sha512', user.salt)
                    .update(userDetails.password)
                    .digest('hex');

                // Does entered password match?
                if (user.password === hashedPassword) {
                    res.json({
                        id: user.userId,
                        username: user.username,
                        email: user.email,
                        token: jwt.sign({ userId: user.userId }, secret, { expiresIn: 86400 })
                    });
                } else {
                    res.status(401);
                    res.send("Incorrect username/password.")
                }
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500);
            res.send("Internal Server Error Occurred - Please try again later.");
        })
    /*.catch(err => {
        res.status(500);
        res.send(err.message);
    })*/
})

router.post('/verify', (req, res) => {
    let token = req.body.token;

    jwt.verify(token, secret, { ignoreExpiration: false }, (err) => {
        if (err) {
            res.status(401);
            res.send("Account credentials have expired")
        } else {
            res.sendStatus(204);
        }
    });
})

router.post('/register', (req, res) => {
    let knex = req.app.get('db');

    let userDetails = req.body;

    // Check user doesn't already exist
    knex("luna_Users")
        .where({ username: userDetails.username })
        .first()
        .then(user => {
            if (user !== undefined) {
                res.status(500);
                res.send("Account already exists.");
            } else {
                // PROCEED WITH CREATION
                let newSalt = generateSalt();

                let hashedPassword = crypto.createHmac('sha512', newSalt)
                    .update(userDetails.password)
                    .digest('hex');

                knex("luna_Users")
                    .insert({
                        username: userDetails.username,
                        password: hashedPassword,
                        salt: newSalt,
                        email: userDetails.email
                    })
                    .returning("userId")
                    .then(ids => {
                        if (ids.length < 1) {
                            res.sendStatus(500);
                        } else {
                            res.json({
                                id: ids[0],
                                username: userDetails.username,
                                email: userDetails.email
                            })
                        }
                    })
            }
        })
});

module.exports = router;