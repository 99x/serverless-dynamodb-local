'use strict';

var spawn = require('child_process').spawn,
    Q = require('q'),
    installer = require('./installer');

const DOWNLOAD_PATH = 'http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_latest.tar.gz',
    JAR = 'DynamoDBLocal.jar',
    DB_PATH = './dynamodb/bin';

var runningProcesses = {},
    dynamodb = {
        /**
         *
         * @param port
         * @param dbPath if omitted will use in memory
         * @param additionalArgs
         * @returns {Promise.<ChildProcess>}
         */
        launch: function (port, dbPath, additionalArgs) {
            if (runningProcesses[port]) {
                return Q.fcall(function () {
                    return runningProcesses[port];
                });
            }

            if (!additionalArgs) {
                additionalArgs = [];
            } else if (Array.isArray(additionalArgs)) {
                additionalArgs = [additionalArgs];
            }

            if (!dbPath) {
                additionalArgs.push('-inMemory');
            } else {
                additionalArgs.push('-dbPath', dbPath);
            }

            return installer.install(DB_PATH, DOWNLOAD_PATH, JAR)
                .then(function () {
                    var args = [
                        '-Djava.library.path=./DynamoDBLocal_lib', '-jar', JAR, '-port', port
                    ];
                    args = args.concat(additionalArgs);
                    console.log(args);

                    var child = spawn('java', args, {
                        cwd: DB_PATH,
                        env: process.env,
                        stdio: ['pipe', 'pipe', process.stderr]
                    });

                    if (!child.pid) {
                        throw new Error('Unable to launch DynamoDBLocal process');
                    }

                    child
                        .on('error', function (err) {
                            console.log('local DynamoDB start error', err);
                            throw new Error('Local DynamoDB failed to start. ');
                        })
                        .on('close', function (code) {
                            if (code !== null && code !== 0) {
                                console.log('Local DynamoDB failed to start with code', code);
                            }
                        });

                    runningProcesses[port] = child;

                    console.log('DynamoDbLocal(' + child.pid + ') started on port', port, 'via java', args.join(' '), 'from CWD', DB_PATH);

                    return child;
                });
        },
        stop: function (port) {
            if (runningProcesses[port]) {
                runningProcesses[port].kill('SIGKILL');
                delete runningProcesses[port];
            }
        },
        relaunch: function (port, db) {
            this.stop(port);
            this.launch(port, db);
        }
    };

module.exports = dynamodb;
