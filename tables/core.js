'use strict';

let BbPromise = require('bluebird'),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    path = require('path'),
    currentPath = path.dirname(__filename),
    optionsPath = path.join(__dirname, '../dynamodb/bin/options.json');

let tables = {
    newTemplate: function (name, tablesPath) {
        return new BbPromise(function (resolve, reject) {
            if (!fs.existsSync(tablesPath)) {
                fs.mkdirSync(tablesPath);
            }
            var template = require(currentPath + '/templates/table.json');
            template.Table.TableName = name;
            fs.writeFile(tablesPath + '/' + name + '.json', JSON.stringify(template, null, 4), function (err) {
                if (err) {
                    return reject(err);
                } else {
                    resolve('New file created in ' + tablesPath + '/' + name + '.json');
                }
            });
        });
    },
    create: function (tablesPath, options) {
        let savedOptions = require(optionsPath),
            dynamodbLocalOptions = {
                region: "localhost",
                endpoint: "http://localhost:" + savedOptions.port
            },
            dynamodb = {
                doc: new AWS.DynamoDB.DocumentClient(dynamodbLocalOptions),
                raw: new AWS.DynamoDB(dynamodbLocalOptions)
            },
            createTable = function (config) {
                return new BbPromise(function (resolve) {
                    dynamodb.raw.createTable(config.Table, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(config.Table.TableName + " created successfully!");
                        }
                        resolve(config);
                    });
                });
            },
            runSeeds = function (config) {
                let params,
                    batchSeeds = config.Seeds.map(function (seed) {
                        return {
                            PutRequest: {
                                Item: seed
                            }
                        };
                    });
                params = {
                    RequestItems: {}
                };
                params.RequestItems[config.Table.TableName] = batchSeeds;
                return new BbPromise(function (resolve, reject) {
                    dynamodb.doc.batchWrite(params, function (err) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log("Seed running complete for table: " + config.Table.TableName);
                            resolve(config);
                        }
                    });
                });
            };

        return new BbPromise(function (resolve, reject) {
            fs.readdirSync(tablesPath).forEach(function (file) {
                var config = require(tablesPath + '/' + file);
                config.Table.TableName = options.prefix + config.Table.TableName + options.suffix;
                createTable(config).then(function (createdTableConfig) {
                    runSeeds(createdTableConfig).then(resolve, reject);
                });
            });
        });
    }
};
module.exports = tables;
