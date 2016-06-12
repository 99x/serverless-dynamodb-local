'use strict';

var BbPromise = require('bluebird'),
    tar = require('tar'),
    zlib = require('zlib'),
    path = require('path'),
    http = require('http'),
    fs = require('fs');

var setup = function (dbPath, downloadPath, jar) {
    return new BbPromise(function (resolve, reject) {
        try {
            if (fs.existsSync(path.join(dbPath, jar))) {
                resolve(true);
            } else {
                download(downloadPath, dbPath).then(resolve, reject);
            }
        } catch (e) {}
    });
};
module.exports.setup = setup;

var remove = function (dbPath) {
    var rmDir = function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    rmDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    return new BbPromise(function (resolve, reject) {
        try {
            rmDir(dbPath);
            console.log("Successfully removed dynamodb local!");
            resolve(true);
        } catch (e) {
            reject(e);
        }
    });
};
module.exports.remove = remove;

var download = function (source, destination) {
    var createDir = function (path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    };
    return new BbPromise(function (resolve, reject) {
        createDir(destination);
        http.get(source, function (response) {
                if (302 != response.statusCode) {
                    reject(new Error('Error getting DynamoDb local latest tar.gz location: ' + response.statusCode));
                }
                http.get(response.headers.location, function (redirectResponse) {
                        var len = parseInt(redirectResponse.headers['content-length'], 10),
                            cur = 0,
                            total = len / 1048576; //1048576 - bytes in 1Megabyte
                        console.log("Downloading dynamodb local (Size " + total.toFixed(2) + " mb). This is one-time operation and can take several minutes ...");
                        if (200 != redirectResponse.statusCode) {
                            reject(new Error('Error getting DynamoDb local latest tar.gz location ' + response.headers.location + ': ' + redirectResponse.statusCode));
                        }
                        redirectResponse
                            .pipe(zlib.Unzip())
                            .pipe(tar.Extract({
                                path: destination
                            }))
                            .on('end', function () {
                                console.log("Installation complete ...");
                                resolve();
                            })
                            .on('error', function (err) {
                                reject(err);
                            }).on("data", function (chunk) {
                                cur += chunk.length;
                                process.stdout.write("Downloading " + (100.0 * cur / len).toFixed(2) + "% \r");
                            });
                    })
                    .on('error', function (e) {
                        reject(e);
                    });
            })
            .on('error', function (e) {
                reject(e);
            });
    });
};
