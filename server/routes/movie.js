/*Program Title: routes/movie.js
Course: CS546-WS
Date: 08/18/2016
Description:
This script handles the /movie routes
*/

var express = require('express');
var data = require("data");
var movies = data.movie;
var uuid = require('node-uuid');
var api = data.api;
var router = express.Router();
var xss = require('xss'); 

//get movie details
router.get('/detail/:id', function (req, res) {
	var movieId = req.params.id;
	var redisConnection = req
		.app
		.get("redis");
	var messageId = uuid.v4();
	var killswitchTimeoutId = undefined;

	redisConnection.on(`details-retrieved:${messageId}`, (details, channel) => {

		redisConnection.off(`details-retrieved:${messageId}`);
		redisConnection.off(`details-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);
		if (details) {
			return res.send(JSON.stringify(details));
		}
	});

	redisConnection.on(`details-retrieved-failed:${messageId}`, (error, channel) => {
		redisConnection.off(`details-retrieved:${messageId}`);
		redisConnection.off(`details-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);
		return res.json(error);
	});

	killswitchTimeoutId = setTimeout(() => {
		redisConnection.off(`details-retrieved:${messageId}`);
		redisConnection.off(`details-retrieved-failed:${messageId}`);
		res
			.status(500)
			.json({ error: "Timeout error" })
	}, 5000);

	redisConnection.emit(`get-details:${messageId}`, {
		requestId: messageId,
		movieId: movieId
	});
});

//get recommended movies
router.get('/recommendations/:id', function (req, res) {
	var movieId = req.params.id;
	var redisConnection = req
		.app
		.get("redis");
	var messageId = uuid.v4();
	var killswitchTimeoutId = undefined;

	redisConnection.on(`recommendations-retrieved:${messageId}`, (movies, channel) => {
		redisConnection.off(`recommendations-retrieved:${messageId}`);
		redisConnection.off(`recommendations-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);
		if (movies) {
			return res.send(JSON.stringify(movies));
		}
	});

	redisConnection.on(`recommendations-retrieved-failed:${messageId}`, (error, channel) => {
		redisConnection.off(`recommendations-retrieved:${messageId}`);
		redisConnection.off(`recommendations-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);

		return res.json(error);
	});

	killswitchTimeoutId = setTimeout(() => {
		redisConnection.off(`recommendations-retrieved:${messageId}`);
		redisConnection.off(`recommendations-retrieved-failed:${messageId}`);
		res
			.status(500)
			.json({ error: "Timeout error" })
	}, 5000);

	redisConnection.emit(`get-recommendations:${messageId}`, {
		requestId: messageId,
		movieId: movieId
	});
});

//get reviews by movie id from api
router.get('/reviews/:id', function (req, res) {
	var movieId = req.params.id;
	var redisConnection = req
		.app
		.get("redis");
	var messageId = uuid.v4();
	var killswitchTimeoutId = undefined;

	redisConnection.on(`reviews-retrieved:${messageId}`, (movies, channel) => {
		redisConnection.off(`reviews-retrieved:${messageId}`);
		redisConnection.off(`reviews-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);
		if (movies) {
			return res.send(JSON.stringify(movies));
		}
	});

	redisConnection.on(`reviews-retrieved-failed:${messageId}`, (error, channel) => {
		redisConnection.off(`reviews-retrieved:${messageId}`);
		redisConnection.off(`reviews-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);
		return res.json(error);
	});

	killswitchTimeoutId = setTimeout(() => {
		redisConnection.off(`reviews-retrieved:${messageId}`);
		redisConnection.off(`reviews-retrieved-failed:${messageId}`);
		res
			.status(500)
			.json({ error: "Timeout error" })
	}, 5000);

	redisConnection.emit(`get-reviews:${messageId}`, {
		requestId: messageId,
		movieId: movieId
	});
});

//ADD REVIEW TO MOVIE
router.post("/reviews/add/", (req, res) => {
    var movieId = req.body.movieId;
	var reviewData = xss(req.body.review);
    var userId = req.session.name;
    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;

    redisConnection.on(`added-review:${messageId}`, (result, channel) => {
        redisConnection.off(`added-review:${messageId}`);
        redisConnection.off(`added-review-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
		if (result) {
            return res.json({ success: true, result: result });
        }

    });

    redisConnection.on(`added-review-failed:${messageId}`, (error, channel) => {
        redisConnection.off(`added-review:${messageId}`);
        redisConnection.off(`added-review-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);
		return res.json({ success: false, error: error });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`added-review:${messageId}`);
        redisConnection.off(`added-review-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`add-review:${messageId}`, {
        requestId: messageId,
        userId: userId,
        movieId: movieId,
        reviewData: reviewData
    });
});

//REMOVE REVIEW FROM MOVIE
router.delete("/movie/:movieId/reviews/:reviewId", (req, res) => {
    var reviewId = req.params.reviewId;
    var movieId = req.params.movieId;

    var redisConnection = req
        .app
        .get("redis");
    var messageId = uuid.v4();
    var killswitchTimeoutId = undefined;


    redisConnection.on(`removed-review:${messageId}`, (result, channel) => {
        redisConnection.off(`removed-review:${messageId}`);
        redisConnection.off(`removed-review-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

		        if (result) {
            return res.json({ success: true, result: result });
        }
    });

    redisConnection.on(`removed-review-failed:${messageId}`, (error, channel) => {

        redisConnection.off(`removed-review:${messageId}`);
        redisConnection.off(`removed-review-failed:${messageId}`);

        clearTimeout(killswitchTimeoutId);

		 return res.json({ success: false, error: error });
    });

    killswitchTimeoutId = setTimeout(() => {
        redisConnection.off(`removed-review:${messageId}`);
        redisConnection.off(`removed-review-failed:${messageId}`);
        res
            .status(500)
            .json({ error: "Timeout error" })
    }, 5000);

    redisConnection.emit(`remove-review:${messageId}`, {
        requestId: messageId,
        movieId: movieId,
        reviewId: reviewId
    });
});



//get all user reviews for movie from movie collection
router.get('/allreviews/:id', function (req, res) {
	var movieId = req.params.id;
	var redisConnection = req
		.app
		.get("redis");
	var messageId = uuid.v4();
	var killswitchTimeoutId = undefined;

	redisConnection.on(`all-reviews-retrieved:${messageId}`, (reviews, channel) => {

		redisConnection.off(`all-reviews-retrieved:${messageId}`);
		redisConnection.off(`all-reviews-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);
		if (reviews) {
			return res.json(reviews);
		}
	});

	redisConnection.on(`all-reviews-retrieved-failed:${messageId}`, (error, channel) => {
		redisConnection.off(`all-reviews-retrieved:${messageId}`);
		redisConnection.off(`all-reviews-retrieved-failed:${messageId}`);

		clearTimeout(killswitchTimeoutId);
				return res
			.json(error);
	});

	killswitchTimeoutId = setTimeout(() => {
		redisConnection.off(`all-reviews-retrieved:${messageId}`);
		redisConnection.off(`all-reviews-retrieved-failed:${messageId}`);
		res
			.status(500)
			.json({ error: "Timeout error" })
	}, 5000);

	redisConnection.emit(`get-all-reviews:${messageId}`, {
		requestId: messageId,
		movieId: movieId
	});
}),


module.exports = router;
