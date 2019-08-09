/* eslint-disable no-undef */
'use strict';

const request = require('supertest');
const expect = require('expect.js');

const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database(':memory:');
const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
        describe('start_lat outside range', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        start_lat: 1000
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                    }, done);
            });
        });

        describe('start_long outside range', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        start_long: 1000
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                    }, done);
            });
        });

        describe('end_lat outside range', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        end_lat: 1000
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                    }, done);
            });
        });

        describe('end_long outside range', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        end_long: 1000
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
                    }, done);
            });
        });

        describe('rider name not assigned', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        start_lat: -6.188225,
                        start_long: 106.698526,
                        end_lat: -6.188153,
                        end_long: 106.738628
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'Rider name must be a non empty string'
                    }, done);
            });
        });

        describe('driver name not assigned', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        start_lat: -6.188225,
                        start_long: 106.698526,
                        end_lat: -6.188153,
                        end_long: 106.738628,
                        rider_name: 'Mychael'
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'Driver name must be a non empty string'
                    }, done);
            });
        });

        describe('driver vehicle name not assigned', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        start_lat: -6.188225,
                        start_long: 106.698526,
                        end_lat: -6.188153,
                        end_long: 106.738628,
                        rider_name: 'Mychael',
                        driver_name: 'Go'
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'Driver vehicle must be a non empty string'
                    }, done);
            });
        });

        describe('ride added successfully', () => {
            it('should return added ride', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        start_lat: -6.188225,
                        start_long: 106.698526,
                        end_lat: -6.188153,
                        end_long: 106.738628,
                        rider_name: 'Mychael',
                        driver_name: 'Go',
                        driver_vehicle: 'Honda Beat'
                    })
                    .expect('Content-Type', /json/)
                    .expect(200, done);
            });
        });
    });

    describe('GET /rides', () => {
        describe('rides found', () => {
            it('should return all rides', (done) => {
                request(app)
                    .get('/rides')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);

                        expect(res.body).to.be.an('array');
                        expect(res.body).to.have.length(1);
                        expect(res.body[0].rideID).to.be.equal(1);
                        return done();
                    });
            });
        });

        describe('invalid value of page', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .get('/rides?page=0&size=10')
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'Page must be an integer and greater than or equal to 1'
                    }, done);
            });
        });

        describe('invalid value of size', () => {
            it('should throw VALIDATION_ERROR', (done) => {
                request(app)
                    .get('/rides?page=1&size=0')
                    .expect('Content-Type', /json/)
                    .expect(400, {
                        error_code: 'VALIDATION_ERROR',
                        message: 'Size must be an integer and greater than or equal to 1'
                    }, done);
            });
        });
    });

    describe('GET /rides/:id', () => {
        describe('ride found', () => {
            const rideID = 2;

            beforeEach(() => {
                const values = [
                    rideID,
                    10,
                    10,
                    11,
                    11,
                    'Mychael',
                    'Go',
                    'Honda Beat'
                ];

                db.run('INSERT INTO Rides(rideID, startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', values, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            });

            it('should give success response', (done) => {
                request(app)
                    .get(`/rides/${rideID}`)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);

                        expect(res.body).to.be.an('array');
                        expect(res.body).to.have.length(1);
                        expect(res.body[0].rideID).to.be.equal(rideID);
                        expect(res.body[0].startLat).to.be.equal(10);
                        expect(res.body[0].startLong).to.be.equal(10);
                        expect(res.body[0].endLat).to.be.equal(11);
                        expect(res.body[0].endLong).to.be.equal(11);
                        expect(res.body[0].riderName).to.be.equal('Mychael');
                        expect(res.body[0].driverName).to.be.equal('Go');
                        expect(res.body[0].driverVehicle).to.be.equal('Honda Beat');
                        return done();
                    });
            });
        });
    });

    describe('security', () => {
        it('prevent sql injection when add ride', (done) => {
            request(app)
                .post('/rides')
                .send({
                    start_lat: -6.188225,
                    start_long: 106.698526,
                    end_lat: -6.188153,
                    end_long: 106.738628,
                    rider_name: 'Mychael\'s OR \'1=1',
                    driver_name: 'Go',
                    driver_vehicle: 'Honda Beat'
                })
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('prevent sql injection when get a single ride', (done) => {
            request(app)
                .get('/rides/3\' OR \'3=3')
                .expect('Content-Type', /json/)
                .expect(400, {
                    error_code: 'VALIDATION_ERROR',
                    message: 'ID must be an integer'
                }, done);
        });
    });
});
