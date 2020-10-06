const config = require("../../config.json");
const { existsSync } = require("fs");
const zip = require("express-zip");
const { Router } = require("express");
const router = Router();

router.get('/jobs', (req, res) => {
    let knex = req.app.get('db');

    knex("build_job")
        .where({
            user_id: req.user.userId
        })
        .then((jobs) => {
            res.json(jobs);
        });
});

router.get('/:jobId/download', (req, res) => {
    let knex = req.app.get('db');

    knex("build_job")
        .where({job_id: req.params.jobId})
        .first()
        .then((job) => {
            if (job) {
                if (job.job_status === 3) {
                    let zipLoc = config.folders.EXPORT_DIR_BASE + `\\${job.extension_id}\\${req.params.jobId}.zip`;
                    console.log("attempting to send zip:", zipLoc);

                    if (existsSync(zipLoc)) {
                        res.download(zipLoc, "HN_Extension.zip");
                    } else {
                        res.sendStatus(404);
                    }


                } else {
                    res.status(400).send("Job not started, or hasn't yet completed.");
                }

            }
        })


})

router.route('/:jobId')
    .get((req, res) => {
        let knex = req.app.get('db');

        knex("build_job")
            .where({job_id: req.params.jobId})
            .first()
            .then(job => {
                if (job) {
                    res.json(job);
                } else {
                    res.status(404).send("Job with that ID not found.");
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let jobInfo = req.body;

        if (!jobInfo.rebuild) {
            knex("build_job")
                .update({
                    job_status: 1,
                    rebuild: false,
                    time_submitted: knex.raw("CURRENT_TIMESTAMP")
                })
                .where({
                    job_id: req.params.jobId
                })
                .then(() => {
                    res.json(jobInfo);
                })
        } else {
            knex("build_job")
                .insert({
                    job_status: 1,
                    user_id: req.user.userId,
                    extension_id: jobInfo.extension_id,
                    rebuild: true
                })
                .returning("job_id")
                .then((ids) => {
                    if (ids.length > 0) {
                        jobInfo.jobId = ids[0];
                        res.json(jobInfo);
                    } else {
                        res.sendStatus(500);
                    }
                })
        }


    })
    .delete((req, res) =>{
        let knex = req.app.get('db');

        knex("build_job")
            .where({
                job_id: req.params.jobId,
                user_id: req.user.userId,
                job_status: 1
            })
            .then(() => {
                res.sendStatus(204);
            })
    });


module.exports = router;
