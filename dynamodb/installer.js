'use strict';

/* TODO: Replace Q with 'bluebird' promise */
var Q = require('q')
    , tar = require('tar')
    , zlib = require('zlib')
    , path = require('path')
    , http = require('http')
    , fs = require('fs');

var install = function (dbPath, downloadPath, jar) {
    console.log("Checking for ", dbPath);
    var deferred = Q.defer();

    try {
        if (fs.existsSync(path.join(dbPath, jar))) {
            return Q.fcall(function () {
                return true;
            });
        }
    } catch (e) {}

    console.log("DynamoDb Local not installed. Installing...");

    if (!fs.existsSync(dbPath))
        fs.mkdirSync(dbPath);

    http.get(downloadPath, function (response) {
            if (302 != response.statusCode) {
                deferred.reject(new Error("Error getting DynamoDb local latest tar.gz location: " + response.statusCode));
            }

            http.get(response.headers['location'], function (redirectResponse) {
                    if (200 != redirectResponse.statusCode) {
                        deferred.reject(new Error("Error getting DynamoDb local latest tar.gz location " + response.headers['location'] + ": " + redirectResponse.statusCode));
                    }
                    redirectResponse
                        .pipe(zlib.Unzip())
                        .pipe(tar.Extract({
                            path: dbPath
                        }))
                        .on('end', function () {
                            deferred.resolve();
                        })
                        .on('error', function (err) {
                            deferred.reject(err);
                        });
                })
                .on('error', function (e) {
                    deferred.reject(e);
                });
        })
        .on('error', function (e) {
            deferred.reject(e);
        });

    return deferred.promise;
}
module.exports.install = install;