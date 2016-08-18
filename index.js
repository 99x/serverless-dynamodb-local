'use strict';

const _ = require('lodash'),
    BbPromise = require('bluebird'),
    dynamodbMigrations = require('dynamodb-migrations'),
    AWS = require('aws-sdk'),
    dynamodbLocal = require('dynamodb-localhost');

module.exports = function (S) {

    class DynamodbLocal extends S.classes.Plugin {

        constructor() {
            super();
            this.name = 'serverless-dynamodb-local'; // Define your plugin's name
        }

        /**
         * Register Actions
         * - If you would like to register a Custom Action or overwrite a Core Serverless Action, add this function.
         * - If you would like your Action to be used programatically, include a "handler" which can be called in code.
         * - If you would like your Action to be used via the CLI, include a "description", "context", "action" and any options you would like to offer.
         * - Your custom Action can be called programatically and via CLI, as in the example provided below
         */
        registerActions() {

            S.addAction(this.create.bind(this), {
                handler: 'dynamodbCreate',
                description: 'Create new migration template with the given name',
                context: 'dynamodb',
                contextAction: 'create',
                options: [{
                    option: 'name',
                    shortcut: 'n',
                    description: 'Create a migration template inside the directlry given in s-project.json with the given name.'
                }]
            });
            S.addAction(this.execute.bind(this), {
                handler: 'dynamodbExecute',
                description: 'Execute a migration template with the given name',
                context: 'dynamodb',
                contextAction: 'execute',
                options: [{
                    option: 'name',
                    shortcut: 'n',
                    description: 'Execute a migration template with the given name'
                }, {
                    option: 'region',
                    shortcut: 'r',
                    description: 'Region that dynamodb should be remotely executed'
                }, {
                    option: 'stage',
                    shortcut: 's',
                    description: 'Stage that dynamodb should be remotely executed'
                }, {
                    option: 'table_prefix',
                    shortcut: 'p',
                    description: 'Table name prefix'
                }, {
                    option: 'table_suffix',
                    shortcut: 'x',
                    description: 'Table name suffix'
                }
                ]
            });
            S.addAction(this.executeAll.bind(this), {
                handler: 'dynamodbExecuteAll',
                description: 'Execute all migration templates',
                context: 'dynamodb',
                contextAction: 'executeAll',
                options: [{
                    option: 'region',
                    shortcut: 'r',
                    description: 'Region that dynamodb should be remotely executed'
                }, {
                    option: 'stage',
                    shortcut: 's',
                    description: 'Stage that dynamodb should be remotely executed'
                }, {
                    option: 'table_prefix',
                    shortcut: 'p',
                    description: 'Table name prefix'
                }, {
                    option: 'table_suffix',
                    shortcut: 'x',
                    description: 'Table name suffix'
                }]
            });
            S.addAction(this.remove.bind(this), {
                handler: 'dynamodbRemove',
                description: 'Remove dynamodb local database. This is needed if the installed version is currupted or needs to be upgraded.',
                context: 'dynamodb',
                contextAction: 'remove'
            });
            S.addAction(this.install.bind(this), {
                handler: 'dynamodbInstall',
                description: 'Install dynamodb local database. This is a single time operation.',
                context: 'dynamodb',
                contextAction: 'install'
            });
            S.addAction(this.start.bind(this), {
                handler: 'dynamodbStart',
                description: 'Start dynamodb local database',
                context: 'dynamodb',
                contextAction: 'start',
                options: [{
                    option: 'port',
                    shortcut: 'p',
                    description: 'The port number that DynamoDB will use to communicate with your application. If you do not specify this option, the default port is 8000'
                }, {
                    option: 'cors',
                    shortcut: 'c',
                    description: 'Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. The default setting for -cors is an asterisk (*), which allows public access.'
                }, {
                    option: 'inMemory',
                    shortcut: 'i',
                    description: 'DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both -dbPath and -inMemory at once.'
                }, {
                    option: 'dbPath',
                    shortcut: 'd',
                    description: 'The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end.'
                }, {
                    option: 'sharedDb',
                    shortcut: 'h',
                    description: 'DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify -sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration.'
                }, {
                    option: 'delayTransientStatuses',
                    shortcut: 't',
                    description: 'Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.)'
                }, {
                    option: 'optimizeDbBeforeStartup',
                    shortcut: 'o',
                    description: 'Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter.'
                }, {
                    option: 'migration',
                    shortcut: 'm',
                    description: 'After starting dynamodb local, run dynamodb migrations'
                }]
            });

            return BbPromise.resolve();
        }

        dynamodbOptions(stage, region) {
            let credentials, config = S.getProject().custom.dynamodb || {},
                port = config.start && config.start.port || 8000,
                dynamoOptions;
            if (stage && region) {
                credentials = S.getProvider('aws').getCredentials(stage, region);
                AWS.config.update({
                    region: region,
                    accessKeyId: credentials.accessKeyId,
                    secretAccessKey: credentials.secretAccessKey,
                    sessionToken: credentials.sessionToken
                });
            } else {
                dynamoOptions = {
                    endpoint: 'http://localhost:' + port,
                    region: 'localhost'
                };
            }

            return {
                raw: new AWS.DynamoDB(dynamoOptions),
                doc: new AWS.DynamoDB.DocumentClient(dynamoOptions)
            };
        }

        tableOptions(table_prefix, table_suffix) {
            let config = S.getProject().custom.dynamodb,
                migration = config && config.migration || {},
                rootPath = S.getProject().getRootPath(),
                path = rootPath + '/' + (migration.dir || 'dynamodb'),
                suffix = table_suffix || migration.table_suffix || '',
                prefix = table_prefix || migration.table_prefix || '';

            return {
                suffix: suffix,
                prefix: prefix,
                path: path
            };
        }

        /**
         * Custom Action Example
         * - Here is an example of a Custom Action.  Include this and modify it if you would like to write your own Custom Action for the Serverless Framework.
         * - Be sure to ALWAYS accept and return the "evt" object, or you will break the entire flow.
         * - The "evt" object contains Action-specific data.  You can add custom data to it, but if you change any data it will affect subsequent Actions and Hooks.
         * - You can also access other Project-specific data @ this.S Again, if you mess with data on this object, it could break everything, so make sure you know what you're doing ;)
         */

        remove() {
            return new BbPromise(function (resolve) {
                dynamodbLocal.remove(resolve);
            });
        }

        install() {
            return new BbPromise(function (resolve) {
                dynamodbLocal.install(resolve);
            });
        }

        execute(evt) {
            let self = this,
                options = evt.options;
            return new BbPromise(function (resolve, reject) {
                let dynamodb = self.dynamodbOptions(options.stage, options.region),
                    tableOptions = self.tableOptions(options.table_prefix, options.table_suffix);
                dynamodbMigrations.init(dynamodb, tableOptions.path);
                dynamodbMigrations.execute(options.name, tableOptions).then(resolve, reject);
            });
        }

        executeAll(evt) {
            let self = this,
                options = evt.options;
            return new BbPromise(function (resolve, reject) {
                let dynamodb = self.dynamodbOptions(options.stage, options.region),
                    tableOptions = self.tableOptions(options.table_prefix, options.table_suffix);
                dynamodbMigrations.init(dynamodb, tableOptions.path);
                dynamodbMigrations.executeAll(tableOptions).then(resolve, reject);
            });
        }

        create(evt) {
            let self = this,
                options = evt.options;
            return new BbPromise(function (resolve, reject) {
                let dynamodb = self.dynamodbOptions(),
                    tableOptions = self.tableOptions();
                dynamodbMigrations.init(dynamodb, tableOptions.path);
                dynamodbMigrations.create(options.name).then(resolve, reject);
            });
        }

        start(evt) {
            let self = this;
            return new BbPromise(function (resolve) {
                let config = S.getProject().custom.dynamodb,
                    options = _.merge({
                            sharedDb: evt.options.sharedDb || true
                        },
                        evt.options,
                        config && config.start
                    );
                if (options.migration) {
                    dynamodbLocal.start(options);
                    console.log(""); // seperator
                    self.executeAll(evt);
                    resolve();
                } else {
                    dynamodbLocal.start(options);
                    console.log("");
                    resolve();
                }
            });
        }
    }

    return DynamodbLocal;
};
