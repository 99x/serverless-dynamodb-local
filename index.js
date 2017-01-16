'use strict';

const _ = require('lodash'),
    BbPromise = require('bluebird'),
    dynamodbMigrations = require('dynamodb-migrations'),
    AWS = require('aws-sdk'),
    dynamodbLocal = require('dynamodb-localhost');

class ServerlessDynamodbLocal {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.service = serverless.service;
        this.options = options;
        this.provider = 'aws';
        this.commands = {
            dynamodb: {
                commands: {
                    create: {
                        lifecycleEvents: ['createHandler'],
                        options: {
                            name: {
                                required: true,
                                shortcut: 'n',
                                usage: 'Create a migration template inside the directlry given in s-project.json with the given name.',
                            }
                        }
                    },
                    execute: {
                        lifecycleEvents: ['executeHandler'],
                        options: {
                            name: {
                                required: true,
                                shortcut: 'n',
                                usage: 'Execute a migration template with the given name'
                            },
                            region: {
                                shortcut: 'r',
                                usage: 'Region that dynamodb should be remotely executed'
                            },
                            stage: {
                                shortcut: 's',
                                usage: 'Stage that dynamodb should be remotely executed'
                            }
                        }
                    },
                    executeAll: {
                        lifecycleEvents: ['executeAllHandler'],
                        options: {
                            stage: {
                                shortcut: 's',
                                usage: 'Stage that dynamodb should be remotely executed'
                            }
                        }
                    },
                    start: {
                        lifecycleEvents: ['startHandler'],
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
                            migration: {
                                shortcut: 'm',
                                usage: 'After starting dynamodb local, run dynamodb migrations'
                            }
                        }
                    },
                    remove: {
                        lifecycleEvents: ['removeHandler']
                    },
                    install: {
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
            'dynamodb:create:createHandler': this.createHandler.bind(this),
            'dynamodb:execute:executeHandler': this.executeHandler.bind(this),
            'dynamodb:executeAll:executeAllHandler': this.executeAllHandler.bind(this),
            'dynamodb:remove:removeHandler': this.removeHandler.bind(this),
            'dynamodb:install:installHandler': this.installHandler.bind(this),
            'dynamodb:start:startHandler': this.startHandler.bind(this),
            'before:offline:start': this.startHandler.bind(this),
        };
    }
    createHandler() {
        let self = this,
            options = this.options;
        return new BbPromise(function(resolve, reject) {
            let dynamodb = self.dynamodbOptions(),
                tableOptions = self.tableOptions();
            dynamodbMigrations.init(dynamodb, tableOptions.path);
            dynamodbMigrations.create(options.name).then(resolve, reject);
        });
    }

	dynamodbOptions(region) {
			let self = this;
            let credentials, config = self.service.custom.dynamodb || {},
                port = config.start && config.start.port || 8000,
                dynamoOptions;
			if(region){
                AWS.config.update({
                    region: region
                });
			}else{
				dynamoOptions = {
			endpoint: 'http://localhost:' + port,
			region: 'localhost',
			accessKeyId: 'MOCK_ACCESS_KEY_ID',
			secretAccessKey: 'MOCK_SECRET_ACCESS_KEY'
                };
			}		
			return {
                raw: new AWS.DynamoDB(dynamoOptions),
                doc: new AWS.DynamoDB.DocumentClient(dynamoOptions)
            };
        }

        tableOptions(table_prefix, table_suffix) {
			let self = this;
            let config = self.service.custom.dynamodb,
                migration = config && config.migration || {},
                rootPath = self.serverless.config.servicePath,
                path = rootPath + '/' + (migration.dir || 'dynamodb'),
                suffix = table_suffix || migration.table_suffix || '',
                prefix = table_prefix || migration.table_prefix || '';

            return {
                suffix: suffix,
                prefix: prefix,
                path: path
            };
        }

    executeHandler() {
        let self = this,
            options = this.options;
        return new BbPromise(function(resolve, reject) {
            let dynamodb = self.dynamodbOptions(options.region),
                tableOptions = self.tableOptions();
            dynamodbMigrations.init(dynamodb, tableOptions.path);
            dynamodbMigrations.execute(options.name, tableOptions).then(resolve, reject);
        });
    }

    executeAllHandler(isOffline) {
        let self = this,
            region = isOffline ? null : self.service.provider.region,
            options = this.options;
        
        return new BbPromise(function(resolve, reject) {
            let dynamodb = self.dynamodbOptions(region),
                tableOptions = self.tableOptions(options.stage);
	        dynamodbMigrations.init(dynamodb, tableOptions.path);
            dynamodbMigrations.executeAll(tableOptions).then(resolve, reject);
        });
    }

    removeHandler() {
        return new BbPromise(function(resolve) {
            dynamodbLocal.remove(resolve);
        });
    }

    installHandler() {
        let self = this,
			options = this.options;
        return new BbPromise(function(resolve) {
	            dynamodbLocal.install(resolve, options.localPath);
        });
    }

    startHandler() {
        let self = this,
            options = this.options;
        return new BbPromise(function(resolve) {
            let config = self.service.custom.dynamodb,
                options = _.merge({
                        sharedDb: self.options.sharedDb || true
                    },
                    self.options,
                    config && config.start
                );
            if (options.migration) {
                dynamodbLocal.start(options);
                console.log(""); // seperator
                self.executeAllHandler(true);
                resolve();
            } else {
                dynamodbLocal.start(options);
                console.log("");
                resolve();
            }
        });
    }
}
module.exports = ServerlessDynamodbLocal;
