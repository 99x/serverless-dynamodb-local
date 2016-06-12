serverless-dynamodb-local
=================================
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-dynamodb-local.svg)](https://badge.fury.io/js/serverless-dynamodb-local)
[![license](https://img.shields.io/npm/l/serverless-dynamodb-local.svg)](https://www.npmjs.com/package/serverless-dynamodb-local)

This Serverless 0.5.x plugin help you to setup dynamodb local instance with much needed features to setup your serverless local development environment.
You can use this with ['serverless-offline'](https://github.com/dherault/serverless-offline) Plugin.

## This Plugin Requires
* Serverless V0.5 or newer
* Java Runtime Engine (JRE) version 6.x or newer

## Features

* Automatically downloads dynamodb local
* Allow to specify all the supported parameters in dynamodb local (e.g port, inMemory, sharedDb)
* Provide you with a set of serverless commands for dynamodb local (e.g seeds, tables)

## Installation

`npm install serverless-dynamodb-local`

Then in `s-project.json` add following entry to the plugins array: `serverless-dynamodb-local`

Like this: `"plugins": ["serverless-dynamodb-local"]`

## Usage

In your project root run:
`sls dynamodb start`

DynamoDB will process incoming requests until you stop it. To stop DynamoDB, type Ctrl+C in the command prompt window

All CLI options are optional:

```
--port                    -p  Port to listen on. Default: 8000
--cors                    -c  Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. The default setting for -cors is an asterisk (*), which allows public access.
--inMemory                -m  DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both -dbPath and -inMemory at once.
--dbPath                  -d  The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end.
--sharedDb                -r  DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify -sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration.
--delayTransientStatuses  -t  Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.)
--optimizeDbBeforeStartup -o  Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter.
```

All the above options can be added to s-function.json to set default configuration: e.g

```json
"custom": {
  "dynamodb": {
    "start": {
      "port": "9000",
      "inMemory": true
    }
  }
}

To remove the installed dynamodb local, run:
`sls dynamodb remove`

## Accessing dynamodb local from your code

You need to add the following parameters to the AWS SDK dynamodb constructor

e.g. for dynamodb document client sdk
```
new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
})
```
e.g. for dynamodb document client sdk
```
new AWS.DynamoDB({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
})

```
Open a browser and go the url http://localhost:8000/shell to access the web shell for dynamodb local

Note: Default port: 8000 and if you change the port, change it accordingly in usage

## Coming up

* Allow you to setup dynamodb tables creation scripts, innside your project and enables to execute them locally as well as remotely with a simple set of commands
* Similar to dynamodb table creation scripts, it also allows to setup your dynamodb data seeds for both local and remote
* Provides the ability to setup your local development environment with the support of ['serverless-offline'](https://github.com/dherault/serverless-offline) Plugin
* A fantastic and welcoming community!

## Links

* [Dynamodb local documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
* [Contact Us](mailto:ashanf@99x.lk)
* [NPM Registry](https://www.npmjs.com/package/serverless-dynamodb-local)

## Contributing

We love our contributors! If you'd like to contribute to the project, feel free to submit a PR. But please keep in mind the following guidelines:

* Propose your changes before you start working on a PR. You can reach us by submitting a Github issue. This is just to make sure that no one else is working on the same change, and to figure out the best way to solve the issue.
* If you're out of ideas, but still want to contribute, help us in solving Github issues already verified.
* Contributions are not just PRs! We'd be grateful for having you, and if you could provide some support for new comers, that be great! You can also do that by answering this plugin related questions on Stackoverflow.
You can also contribute by writing. Feel free to let us know if you want to publish a useful guides, improve the documentation (attributed to you, thank you!) that you feel will help the community.

## Development Setup

* Make a Serverless Project dedicated for plugin development, or use an existing Serverless Project
* Make a "plugins" folder in the root of your Project and copy this codebase into it. Title it your custom plugin name with the suffix "-dev", like "myplugin-dev"
* Go to root of your Project and edit the s-project.json and add
```
"plugins": [
"serverless-dynamodb-local"
]
```
* Open a commandline from your root Project folder and Start a new dynamodb instance by running 
```
sls dynamodb start
```
* Go to dynamodb local [shell](http://localhost:8000/shell) in your browser and you should be able to see use the web shell

## Credits

Bunch of thanks to doapp-ryanp who started [dynamodb-local](https://github.com/doapp-ryanp/dynamodb-local) project