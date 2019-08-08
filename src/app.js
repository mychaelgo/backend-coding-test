'use strict';

const express = require('express');
const app = express();
var path = require('path');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use('/docs', express.static(path.join('public/docs')));

module.exports = (db) => {

    /**
     * @api {get} /health Get System Health
     * @apiName Get System Health
     * @apiGroup Health
     * @apiDescription Health is an endpoint to check healthy status
     *
     * @apiSuccessExample {html} Success-Response:
     * HTTP/1.1 200 OK
     * Healthy
     */
    app.get('/health', (req, res) => res.send('Healthy'));


    /**
     * @api {post} /rides Create new ride
     * @apiName Post Rides
     * @apiGroup Rides
     * @apiDescription Create new ride
     * 
     * @apiParam {Number} start_lat Start latitude
     * @apiParam {Number} start_long Start longitude
     * @apiParam {Number} end_lat End latitude
     * @apiParam {Number} end_long Start latitude
     * @apiParam {String} rider_name Rider name
     * @apiParam {String} driver_name Driver name
     * @apiParam {String} driver_vehicle Driver vehicle
     * 
     * 
     * @apiParamExample {json} Request-Example:
     * {
     *      "start_lat": -6.188225,
     *      "start_long": 106.698526,
     *      "end_lat": -6.188153,
     *      "end_long": 106.738628,
     *      "rider_name": "Mychael",
     *      "driver_name": "Go",
     *      "driver_vehicle": "Honda Beat",
     * }
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *      {
     *          "rideID": 1,
     *          "startLat": -6.188225,
     *          "startLong": 106.698526,
     *          "endLat": -6.188153,
     *          "endLong": 106.738628,
     *          "riderName": "Mychael",
     *          "driverName": "Go",
     *          "driverVehicle": "Honda Beat",
     *          "created": "2019-08-08 03:21:09"
     *      }
     * ]
     * 
     * @apiErrorExample {json} Validation Error-Response:
     * HTTP/1.1 400
     * {
     *      "error_code": "VALIDATION_ERROR",
     *      "message": "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
     * }
     * @apiErrorExample {json} Server Error-Response:
     * HTTP/1.1 500
     * {
     *      "error_code": "SERVER_ERROR",
     *      "message": "Unknown error",
     * }
     */
    app.post('/rides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Driver name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.status(400).send({
                error_code: 'VALIDATION_ERROR',
                message: 'Driver vehicle must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return res.status(500).send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.send(rows);
            });
        });
    });


    /**
     * @api {get} /rides Get all rides
     * @apiName Get All Rides
     * @apiGroup Rides
     * @apiDescription Get all rides
     * 
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *      {
     *          "rideID": 1,
     *          "startLat": -6.188225,
     *          "startLong": 106.698526,
     *          "endLat": -6.188153,
     *          "endLong": 106.738628,
     *          "riderName": "Mychael",
     *          "driverName": "Go",
     *          "driverVehicle": "Honda Beat",
     *          "created": "2019-08-08 03:21:09"
     *      }
     * ]
     * 
     * @apiErrorExample {json} Rides Error-Response:
     * HTTP/1.1 404
     * {
     *      "error_code": "RIDES_NOT_FOUND_ERROR",
     *      "message": "Could not find any rides",
     * }
     * @apiErrorExample {json} Server Error-Response:
     * HTTP/1.1 500
     * {
     *      "error_code": "SERVER_ERROR",
     *      "message": "Unknown error",
     * }
     */
    app.get('/rides', (req, res) => {
        db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.status(404).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });


    /**
     * @api {get} /rides/:id Get rides by ID
     * @apiName Get Rides by ID
     * @apiGroup Rides
     * @apiDescription Get rides by ID
     * 
     * @apiParam {Number} id Rides unique ID.
     * 
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *      {
     *          "rideID": 1,
     *          "startLat": -6.188225,
     *          "startLong": 106.698526,
     *          "endLat": -6.188153,
     *          "endLong": 106.738628,
     *          "riderName": "Mychael",
     *          "driverName": "Go",
     *          "driverVehicle": "Honda Beat",
     *          "created": "2019-08-08 03:21:09"
     *      }
     * ]
     * 
     * @apiErrorExample {json} Rides Error-Response:
     * HTTP/1.1 404
     * {
     *      "error_code": "RIDES_NOT_FOUND_ERROR",
     *      "message": "Could not find any rides",
     * }
     * @apiErrorExample {json} Server Error-Response:
     * HTTP/1.1 500
     * {
     *      "error_code": "SERVER_ERROR",
     *      "message": "Unknown error",
     * }
     */
    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.status(500).send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.status(400).send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};