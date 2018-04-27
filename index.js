"use strict";
const _ = require("lodash");
const BbPromise = require("bluebird");
const AWS = require("aws-sdk");
const dynamodbLocal = require("dynamodb-localhost");
const seeder = require("./src/seeder");

class ServerlessDynamodbLocal {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.service = serverless.service;
        this.serverlessLog = serverless.cli.log.bind(serverless.cli);
        this.config = this.service.custom && this.service.custom.dynamodb || {};
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
                        usage: "Seeds local DynamoDB tables with data",
                        options: {
                            online: {
                                shortcut: "o",
                                usage: "Will connect to the tables online to do an online seed run"
                            }
                        }
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
                                usage: "After starting dynamodb local, create DynamoDB tables from the current serverless configuration."
                            },
                            seed: {
                                shortcut: "s",
                                usage: "After starting and migrating dynamodb local, injects seed data into your tables. The --seed option determines which data categories to onload.",
                            }
                        }
                    },
                    noStart: {
                      shortcut: "n",
                      default: false,
                      usage: "Do not start DynamoDB local (in case it is already running)",
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
            "dynamodb:seed:seedHandler": this.seedHandler.bind(this),
            "dynamodb:remove:removeHandler": this.removeHandler.bind(this),
            "dynamodb:install:installHandler": this.installHandler.bind(this),
            "dynamodb:start:startHandler": this.startHandler.bind(this),
            "before:offline:start:init": this.startHandler.bind(this),
            "before:offline:start:end": this.endHandler.bind(this),
        };
    }

    get port() {
        const config = this.config;
        const port = _.get(config, "start.port", 8000);
        return port;
    }

    get host() {
        const config = this.config;
        const host = _.get(config, "start.host", "localhost");
        return host;
    }

    dynamodbOptions(options) {
        let dynamoOptions = {};

        if(options && options.online){
            this.serverlessLog("Connecting to online tables...");
            if (!options.region) { 
                throw new Error("please specify the region");
            }
            dynamoOptions = {
                region: options.region,
            };
        } else {
            dynamoOptions = {
                endpoint: `http://${this.host}:${this.port}`,
                region: "localhost",
                accessKeyId: "MOCK_ACCESS_KEY_ID",
                secretAccessKey: "MOCK_SECRET_ACCESS_KEY"
            };
        }

        return {
            raw: new AWS.DynamoDB(dynamoOptions),
            doc: new AWS.DynamoDB.DocumentClient(dynamoOptions)
        };
    }

    migrateHandler() {
        const dynamodb = this.dynamodbOptions();
        const tables = this.tables;
        return BbPromise.each(tables, (table) => this.createTable(dynamodb, table));
    }

    seedHandler() {
        const options = this.options; 
        const dynamodb = this.dynamodbOptions(options);

        return BbPromise.each(this.seedSources, (source) => {
            if (!source.table) {
                throw new Error("seeding source \"table\" property not defined");
            }
            const seedPromise = seeder.locateSeeds(source.sources || [])
            .then((seeds) => seeder.writeSeeds(dynamodb.doc.batchWrite.bind(dynamodb.doc), source.table, seeds));
            const rawSeedPromise = seeder.locateSeeds(source.rawsources || [])
            .then((seeds) => seeder.writeSeeds(dynamodb.raw.batchWriteItem.bind(dynamodb.raw), source.table, seeds));
            return BbPromise.all([seedPromise, rawSeedPromise]);
        });
    }

    removeHandler() {
        return new BbPromise((resolve) => dynamodbLocal.remove(resolve));
    }

    installHandler() {
        const options = this.options;
        return new BbPromise((resolve) => dynamodbLocal.install(resolve, options.localPath));
    }

    startHandler() {
        const config = this.config;
        const options = _.merge({
                sharedDb: this.options.sharedDb || true
            },
            config && config.start,
            this.options
        );

        // otherwise endHandler will be mis-informed
        this.options = options;
        if (!options.noStart) {
          dynamodbLocal.start(options);
        }
        return BbPromise.resolve()
        .then(() => options.migrate && this.migrateHandler())
        .then(() => options.seed && this.seedHandler());
    }

    endHandler() {
        if (!this.options.noStart) {
            this.serverlessLog("DynamoDB - stopping local database");
            dynamodbLocal.stop(this.port);
        }
    }

    getDefaultStack() {
        return _.get(this.service, "resources");
    }

    getAdditionalStacks() {
        return _.values(_.get(this.service, "custom.additionalStacks", {}));
    }

    hasAdditionalStacksPlugin() {
        return _.get(this.service, "plugins", []).includes("serverless-plugin-additional-stacks");
    }

    getTableDefinitionsFromStack(stack) {
        const resources = _.get(stack, "Resources", []);
        return Object.keys(resources).map((key) => {
            if (resources[key].Type === "AWS::DynamoDB::Table") {
                return resources[key].Properties;
            }
        }).filter((n) => n);
    }

    /**
     * Gets the table definitions
     */
    get tables() {
        let stacks = [];

        const defaultStack = this.getDefaultStack();
        if (defaultStack) {
            stacks.push(defaultStack);
        }

        if (this.hasAdditionalStacksPlugin()) {
            stacks = stacks.concat(this.getAdditionalStacks());
        }

        return stacks.map((stack) => this.getTableDefinitionsFromStack(stack)).reduce((tables, tablesInStack) => tables.concat(tablesInStack), []);
    }

    /**
     * Gets the seeding sources
     */
    get seedSources() {
        const config = this.service.custom.dynamodb;
        const seedConfig = _.get(config, "seed", {});
        const seed = this.options.seed || config.start.seed || seedConfig;
        let categories;
        if (typeof seed === "string") {
            categories = seed.split(",");
        } else if(seed) {
            categories = Object.keys(seedConfig);
        } else { // if (!seed)
            this.serverlessLog("DynamoDB - No seeding defined. Skipping data seeding.");
            return [];
        }
        const sourcesByCategory = categories.map((category) => seedConfig[category].sources);
        return [].concat.apply([], sourcesByCategory);
    }

    createTable(dynamodb, migration) {
        return new BbPromise((resolve, reject) => {
            if (migration.StreamSpecification && migration.StreamSpecification.StreamViewType) {
                migration.StreamSpecification.StreamEnabled = true;
            }
            if (migration.TimeToLiveSpecification) {
              delete migration.TimeToLiveSpecification;
            }
            if (migration.SSESpecification) {
              migration.SSESpecification.Enabled = migration.SSESpecification.SSEEnabled;
              delete migration.SSESpecification.SSEEnabled;
            }
            if (migration.Tags) {
                delete migration.Tags;
            }
            dynamodb.raw.createTable(migration, (err) => {
                if (err) {
                    if (err.name === 'ResourceInUseException') {
                        this.serverlessLog(`DynamoDB - Warn - table ${migration.TableName} already exists`);
                        resolve();
                    } else {
                        this.serverlessLog("DynamoDB - Error - ", err);
                        reject(err);
                    }
                } else {
                    this.serverlessLog("DynamoDB - created table " + migration.TableName);
                    resolve(migration);
                }
            });
        });
    }
}
module.exports = ServerlessDynamodbLocal;
