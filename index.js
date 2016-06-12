'use strict';

const BbPromise = require('bluebird'),
    dynamodb = require('./dynamodb/core');

module.exports = function (S) { // Always pass in the ServerlessPlugin Class

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

            S.addAction(this._removeDynamodb.bind(this), {
                handler: 'remove',
                description: 'Remove dynamodb local database. This is needed if the installed version is currupted or needs to be upgraded.',
                context: 'dynamodb',
                contextAction: 'remove'
            });
            S.addAction(this._startDynamodb.bind(this), {
                handler: 'start',
                description: 'Start dynamodb local database',
                context: 'dynamodb',
                contextAction: 'start',
                options: [{ // These must be specified in the CLI like this "-port true" or "-p true"
                    option: 'port',
                    shortcut: 'p',
                    description: 'The port number that DynamoDB will use to communicate with your application. If you do not specify this option, the default port is 8000'
        }, { // These must be specified in the CLI like this "-port true" or "-p true"
                    option: 'cors',
                    shortcut: 'c',
                    description: 'Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. The default setting for -cors is an asterisk (*), which allows public access.'
        }, {
                    option: 'inMemory',
                    shortcut: 'm',
                    description: 'DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both -dbPath and -inMemory at once.'
        }, {
                    option: 'dbPath',
                    shortcut: 'd',
                    description: 'The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end.'
        }, {
                    option: 'sharedDb',
                    shortcut: 'r',
                    description: 'DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify -sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration.'
        }, {
                    option: 'delayTransientStatuses',
                    shortcut: 't',
                    description: 'Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.)'
        }, {
                    option: 'optimizeDbBeforeStartup',
                    shortcut: 'o',
                    description: 'Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter.'
        }]
            });

            return BbPromise.resolve();
        }

        /**
         * Custom Action Example
         * - Here is an example of a Custom Action.  Include this and modify it if you would like to write your own Custom Action for the Serverless Framework.
         * - Be sure to ALWAYS accept and return the "evt" object, or you will break the entire flow.
         * - The "evt" object contains Action-specific data.  You can add custom data to it, but if you change any data it will affect subsequent Actions and Hooks.
         * - You can also access other Project-specific data @ this.S Again, if you mess with data on this object, it could break everything, so make sure you know what you're doing ;)
         */
        _startDynamodb(evt) {
            let options = evt.options;
            options.sharedDb = options.sharedDb || true; // Default sharedDb = true
            return dynamodb.start(options);
        }

        _removeDynamodb() {
            return dynamodb.remove();
        }
    }

    return DynamodbLocal;
};
