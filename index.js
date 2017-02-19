"use strict";
const _ = require("lodash");
const BbPromise = require("bluebird");
const AWS = require("aws-sdk");
const dynamodbLocal = require("dynamodb-localhost");
const { writeSeeds, locateSeeds } = require("./src/seeder");

class ServerlessDynamodbLocal {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.service = serverless.service;
        this.options = options;
        this.provider = "aws";
        this.commands = {
            dynamodb: {
                commands: {
                    migrate: {
                        lifecycleEvents: ["migrateHandler"],
                        usage: "Creates local DynamoDB tables from the current Serverless configuration"
                    },
                    seed: {
                        lifecycleEvents: ["seedHandler"],
                        usage: "Seeds local DynamoDB tables with data"
                    },
                    start: {
                        lifecycleEvents: ["startHandler"],
                        usage: "Starts local DynamoDB",
                        options: {
                            port: {
                                shortcut: "p",
                                usage: "The port number that DynamoDB will use to communicate with your application. If you do not specify this option, the default port is 8000"
                            },
                            cors: {
                                shortcut: "c",
                                usage: "Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated \"allow\" list of specific domains. The default setting for -cors is an asterisk (*), which allows public access."
                            },
                            inMemory: {
                                shortcut: "i",
                                usage: "DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both -dbPath and -inMemory at once."
                            },
                            dbPath: {
                                shortcut: "d",
                                usage: "The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end."
                            },
                            sharedDb: {
                                shortcut: "h",
                                usage: "DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify -sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration."
                            },
                            delayTransientStatuses: {
                                shortcut: "t",
                                usage: "Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status."
                            },
                            optimizeDbBeforeStartup: {
                                shortcut: "o",
                                usage: "Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter."
                            },
                            migrate: {
                                shortcut: "m",
                                usage: "After starting dynamodb local, create DynamoDB tables from the current serverless configuration"
                            },
                            seed: {
                                shortcut: "s",
                                usage: "After starting and migrating dynamodb local, injects seed data into your tables",
                            }
                        }
                    },
                    remove: {
                        lifecycleEvents: ["removeHandler"],
                        usage: "Removes local DynamoDB"
                    },
                    install: {
                        usage: "Installs local DynamoDB",
                        lifecycleEvents: ["installHandler"],
                        options: {
                            localPath: {
                                shortcut: "x",
                                usage: "Local dynamodb install path"
                            }
                        }

                    }
                }
            }
        };

        this.hooks = {
            "dynamodb:migrate:migrateHandler": this.migrateHandler.bind(this),
            "dynamodb:migrate:seedHandler": this.seedHandler.bind(this),
            "dynamodb:remove:removeHandler": this.removeHandler.bind(this),
            "dynamodb:install:installHandler": this.installHandler.bind(this),
            "dynamodb:start:startHandler": this.startHandler.bind(this),
            "before:offline:start:init": this.startHandler.bind(this),
        };
    }

    dynamodbOptions() {
        const config = this.service.custom.dynamodb || {};
        const port = config.start && config.start.port || 8000;
        const dynamoOptions = {
            endpoint: "http://localhost:" + port,
            region: "localhost",
            accessKeyId: "MOCK_ACCESS_KEY_ID",
            secretAccessKey: "MOCK_SECRET_ACCESS_KEY"
        };

        return {
            raw: new AWS.DynamoDB(dynamoOptions),
            doc: new AWS.DynamoDB.DocumentClient(dynamoOptions)
        };
    }

    migrateHandler() {
        const dynamodb = this.dynamodbOptions();
        const { tables } = this;
        return BbPromise.each(tables, table => this.createTable(dynamodb, table));
    }

    seedHandler() {
        const { doc: documentClient } = this.dynamodbOptions();
        const { seedSources } = this;
        return BbPromise.each(seedSources, source => {
            if (!source.table) {
                throw new Error("seeding source 'table' not defined");
            }
            return locateSeeds(source.sources || [])
            .then((seeds) => writeSeeds(documentClient, source.table, seeds));
        });
    }

    removeHandler() {
        return new BbPromise(resolve => dynamodbLocal.remove(resolve));
    }

    installHandler() {
        const { options } = this;
        return new BbPromise((resolve) => dynamodbLocal.install(resolve, options.localPath));
    }

    startHandler() {
        const config = this.service.custom.dynamodb;
        const options = _.merge({
                sharedDb: this.options.sharedDb || true
            },
            this.options,
            config && config.start
        );

        dynamodbLocal.start(options);
        console.log(""); // separator

        return BbPromise.resolve()
        .then(() => options.migrate && this.migrateHandler())
        .then(() => options.seed && this.seedHandler());
    }

    /**
     * Gets the table definitions
     */
    get tables() {
        const resources = this.service.resources.Resources;
        return Object.keys(resources).map((key) => {
            if (resources[key].Type == "AWS::DynamoDB::Table") {
                return resources[key].Properties;
            }
        }).filter(n => n);
    }

    /**
     * Gets the seeding sources
     */
    get seedSources() {
        const config = this.service.custom.dynamodb;
        return _.get(config, "start.seeds", []);
    }

    createTable(dynamodb, migration) {
        return new BbPromise((resolve, reject) => {
            dynamodb.raw.createTable(migration, (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log("Table creation completed for table: " + migration.TableName);
                    resolve(migration);
                }
            });
        });
    }
}
module.exports = ServerlessDynamodbLocal;