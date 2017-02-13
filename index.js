'use strict';

const _ = require('lodash'),
    BbPromise = require('bluebird'),
    AWS = require('aws-sdk'),
    dynamodbLocal = require('dynamodb-localhost');

class ServerlessDynamodbLocal {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.service = serverless.service;
        this.config = this.service.custom && this.service.custom.dynamodb || {};
        this.options = options;
        this.provider = 'aws';
        this.commands = {
            dynamodb: {
                commands: {
                    migrate: {
                        lifecycleEvents: ['migrateHandler'],
                        usage: 'Creates local DynamoDB tables from the current Serverless configuration'
                    },
                    start: {
                        lifecycleEvents: ['startHandler'],
                        usage: 'Starts local DynamoDB',
                        options: {
                            port: {
                                shortcut: 'p',
                                usage: 'The port number that DynamoDB will use to communicate with your application. If you do not specify this option, the default port is 8000'
                            },
                            cors: {
                                shortcut: 'c',
                                usage: 'Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. The default setting for -cors is an asterisk (*), which allows public access.'
                            },
                            inMemory: {
                                shortcut: 'i',
                                usage: 'DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both -dbPath and -inMemory at once.'
                            },
                            dbPath: {
                                shortcut: 'd',
                                usage: 'The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end.'
                            },
                            sharedDb: {
                                shortcut: 'h',
                                usage: 'DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify -sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration.'
                            },
                            delayTransientStatuses: {
                                shortcut: 't',
                                usage: 'Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.'
                            },
                            optimizeDbBeforeStartup: {
                                shortcut: 'o',
                                usage: 'Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter.'
                            },
                            migrate: {
                                shortcut: 'm',
                                usage: 'After starting dynamodb local, create DynamoDB tables from the current serverless configuration'
                            }
                        }
                    },
                    remove: {
                        lifecycleEvents: ['removeHandler'],
                        usage: 'Removes local DynamoDB'
                    },
                    install: {
                        usage: 'Installs local DynamoDB',
                        lifecycleEvents: ['installHandler'],
                        options: {
                            localPath: {
                                shortcut: 'x',
                                usage: 'Local dynamodb install path'
                            }
                        }

                    }
                }
            }
        };

        this.hooks = {
            'dynamodb:migrate:migrateHandler': this.migrateHandler.bind(this),
            'dynamodb:remove:removeHandler': this.removeHandler.bind(this),
            'dynamodb:install:installHandler': this.installHandler.bind(this),
            'dynamodb:start:startHandler': this.startHandler.bind(this),
            'before:offline:start': this.startHandler.bind(this),
        };
    }

    dynamodbOptions() {
        let self = this;
        let port = self.config.start && self.config.start.port || 8000,
            dynamoOptions = {
                endpoint: 'http://localhost:' + port,
                region: 'localhost',
                accessKeyId: 'MOCK_ACCESS_KEY_ID',
                secretAccessKey: 'MOCK_SECRET_ACCESS_KEY'
            };

        return {
            raw: new AWS.DynamoDB(dynamoOptions),
            doc: new AWS.DynamoDB.DocumentClient(dynamoOptions)
        };
    }

    migrateHandler() {
        let self = this;

        return new BbPromise(function (resolve, reject) {
            let dynamodb = self.dynamodbOptions();

            var tables = self.resourceTables();

            return BbPromise.each(tables, function (table) {
                return self.createTable(dynamodb, table);
            }).then(resolve, reject);
        });
    }

    removeHandler() {
        return new BbPromise(function (resolve) {
            dynamodbLocal.remove(resolve);
        });
    }

    installHandler() {
        let options = this.options;
        return new BbPromise(function (resolve) {
            dynamodbLocal.install(resolve, options.localPath);
        });
    }

    startHandler() {
        let self = this;
        return new BbPromise(function (resolve) {
            let options = _.merge({
                        sharedDb: self.options.sharedDb || true
                    },
                    self.options,
                    self.config && self.config.start
                );
            if (options.migrate) {
                dynamodbLocal.start(options);
                console.log(""); // seperator
                self.migrateHandler(true);
                resolve();
            } else {
                dynamodbLocal.start(options);
                console.log("");
                resolve();
            }
        });
    }

    resourceTables() {
        var resources = this.service.resources.Resources;
        return Object.keys(resources).map(function (key) {
            if (resources[key].Type == 'AWS::DynamoDB::Table') {
                return resources[key].Properties;
            }
        }).filter(n => {
            return n;
        });
    }

    createTable(dynamodb, migration) {
        return new BbPromise(function (resolve) {
            dynamodb.raw.createTable(migration, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Table creation completed for table: " + migration.TableName);
                }
                resolve(migration);
            });
        });
    }
}
module.exports = ServerlessDynamodbLocal;
