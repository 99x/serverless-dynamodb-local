'use strict';

let BbPromise = require('bluebird'),
    tar = require('tar'),
    zlib = require('zlib'),
    path = require('path'),
    http = require('http'),
    fs = require('fs');
    

let download = function (source, destination, spinner) {
    let createDir = function (path) {
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
                        let len = parseInt(redirectResponse.headers['content-length'], 10),
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
                                spinner.stop(true);
                                console.log("Installation complete ...");
                                resolve();
                            })
                            .on('error', function (err) {
                                reject(err);
                            }).on("data", function (chunk) {
                                cur += chunk.length;
                                //process.stdout.write("Downloading " + (100.0 * cur / len).toFixed(2) + "% \r");
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

let setup = function (dbPath, downloadPath, jar, spinner) {
    return new BbPromise(function (resolve, reject) {
        try {
            if (fs.existsSync(path.join(dbPath, jar))) {
                spinner.stop(true);
                resolve(true);
            } else {
                download(downloadPath, dbPath, spinner).then(resolve, reject);
            }
        } catch (e) {}
    });
};
module.exports.setup = setup;

let remove = function (dbPath) {
    let rmDir = function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file) {
                let curPath = path + "/" + file;
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
