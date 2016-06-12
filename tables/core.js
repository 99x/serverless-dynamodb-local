'use strict';

let BbPromise = require('bluebird'),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    dynamodbLocalOptions = {
        region: "localhost",
        endpoint: "http://localhost:8000"
    },
    dynamodb = {
        doc: new AWS.DynamoDB.DocumentClient(dynamodbLocalOptions),
        raw: new AWS.DynamoDB(dynamodbLocalOptions)
    },
    path = require('path'),
    currentPath = path.dirname(__filename);

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
        let createTable = function (config) {
                return new BbPromise(function (resolve) {
                    dynamodb.raw.createTable(config.Table, function (err) {
                        if (err) {
                            console.log(err);
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
                            reject(err);
                        } else {
                            resolve(config);
                        }
                    });
                });
            };
        /* Create all the tables first */
        fs.readdirSync(tablesPath).forEach(function (file) {
            var config = require(tablesPath + '/' + file);
            config.Table.TableName = options.prefix + config.Table.TableName + options.suffix;
            createTable(config).then(function (createdTableConfig) {
                console.log(createdTableConfig.Table.TableName + " table created!");
                // TODO: Seed running is not working
                runSeeds(createdTableConfig).then(function (createdSeedConfig) {
                    console.log(createdSeedConfig.Table.TableName + " seed running complete!");
                });
            });
        });
    }
};
module.exports = tables;
