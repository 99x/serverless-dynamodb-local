'use strict';

let spawn = require('child_process').spawn,
    BbPromise = require('bluebird'),
    path = require('path'),
    fs = require('fs'),
    installer = require('./installer');

const DOWNLOAD_PATH = 'http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.tar.gz',
    JAR = 'DynamoDBLocal.jar',
    DB_PATH = path.dirname(__filename) + '/bin';

let runningProcesses = {},
    writeFile = function(name, data) {
        return new BbPromise(function(resolve, reject) {
            fs.writeFile(name, JSON.stringify(data, null, 4), function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(name);
                }
            });
        });
    },
    dynamodb = {
        /**
         *
         * @param options
         * @returns {Promise.<ChildProcess>}
         */
        start: function(options, spinner) {
            return new BbPromise(function(resolve, reject) {
                /* Dynamodb local documentation http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html */
                let additionalArgs = [],
                    downloadDirectory = options.downloadDirectory || DB_PATH;
                options.port = options.port || 8000;

                if (options.dbPath) { 
                    additionalArgs.push('-dbPath', options.dbPath);
                } else {
                    additionalArgs.push('-inMemory');
                }
                if (options.sharedDb) {
                    additionalArgs.push('-sharedDb');
                }
                if (options.cors) {
                    additionalArgs.push('-cors', options.cors);
                }
                if (options.delayTransientStatuses) {
                    additionalArgs.push('-delayTransientStatuses');
                }
                if (options.optimizeDbBeforeStartup) {
                    additionalArgs.push('-optimizeDbBeforeStartup');
                }
                if (options.help) {
                    additionalArgs.push('-help');
                }
                installer.setup(downloadDirectory, DOWNLOAD_PATH, JAR, spinner)
                    .then(function() {
                        let args = [
                            '-Djava.library.path=' + downloadDirectory + '/DynamoDBLocal_lib', '-jar', JAR, '-port', options.port
                        ];
                        args = args.concat(additionalArgs);
                        let child = spawn('java', args, {
                            cwd: downloadDirectory,
                            env: process.env,
                            stdio: ['pipe', 'pipe', process.stderr]
                        });
                        if (!child.pid) {
                            throw new Error('Unable to start DynamoDB Local process!');
                        }
                        child
                            .on('error', function(err) {
                                console.log('DynamoDB local start error', err);
                                throw new Error('DynamoDB Local failed to start!');
                            })
                            .on('close', function(code) {
                                if (code !== null && code !== 0) {
                                    console.log('DynamoDB Local failed to start with code', code);
                                }
                            });
                        runningProcesses[options.port] = child;
                        console.log('Started: Dynamodb local(pid=' + child.pid + ') ', 'via java', args.join(' '));
                        console.log('Visit: http://localhost:' + options.port + '/shell');
                        writeFile(DB_PATH + '/options.json', options).then(resolve, reject);
                        writeFile(DB_PATH + '/path.json', downloadDirectory);
                    });
            });
        },
        stop: function(port) {
            if (runningProcesses[port]) {
                runningProcesses[port].kill('SIGKILL');
                delete runningProcesses[port];
            }
        },
        restart: function(port, db) {
            this.stop(port);
            this.start(port, db);
        },
        remove: function() {
            let downloadedDirectory = JSON.parse(fs.readFileSync(DB_PATH + '/path.json', 'utf8'));
            console.log("removing dynamodb from ", downloadedDirectory);
            installer.remove(downloadedDirectory);
        }
    };

module.exports = dynamodb;
