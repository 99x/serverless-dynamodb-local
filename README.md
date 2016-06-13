serverless-dynamodb-local
=================================

[![Join the chat at https://gitter.im/99xt/serverless-dynamodb-local](https://badges.gitter.im/99xt/serverless-dynamodb-local.svg)](https://gitter.im/99xt/serverless-dynamodb-local?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
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

`npm install --save serverless-dynamodb-local`

Then in `s-project.json` add following entry to the plugins array: `serverless-dynamodb-local`

Like this: `"plugins": ["serverless-dynamodb-local"]`

## Starting Dynamodb Local

In your project root run (Note: Run this command first before any other command, since it will download the dynamodb local during the first run):
`sls dynamodb start`

DynamoDB will process incoming requests until you stop it. To stop DynamoDB, type Ctrl+C in the command prompt window

All CLI options are optional:

```
--port                    -p  Port to listen on. Default: 8000
--cors                    -r  Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. The default setting for -cors is an asterisk (*), which allows public access.
--inMemory                -m  DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both -dbPath and -inMemory at once.
--dbPath                  -d  The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end.
--sharedDb                -h  DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify -sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration.
--delayTransientStatuses  -t  Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.)
--optimizeDbBeforeStartup -o  Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter.
--create                  -c  After starting dynamodb local, create dynamodb tables and run seeds. Check the "Manage tables and seeds" section for more information.
```

All the above options can be added to s-project.json to set default configuration: e.g

```json
"custom": {
  "dynamodb": {
    "start": {
      "port": "8000",
      "inMemory": true,
      "create": true
    }
  }
}
```

To remove the installed dynamodb local, run:
`sls dynamodb remove`

## Manage tables and seeds

Start dynamodb local instance in another window before running the following commands. To store your dynamodb table creation and seed configurations do the following configuration (If not specified default directory <project-root>/dynamodb)

```json
"custom": {
  "dynamodb": {
    "table": {
      "dir": "dynamodbTables",
      "prefix": "",
      "suffix": ""
    }
  }
}
```

To create table & seed template in your project root, run:
`sls dynamodb table -n <your-table-name>`

This will create a template json inside configured directory. Open the file and edit the table schema and data.

References
* Defining table schema (Dynamodb SDK): http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property
* Defining seeds (Dynamodb Document Client SDK): http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property

To create table & run the seeds in your project root, run:
`sls dynamodb table -c`

If you need to prefix_<your-table-name>_suffix, you can configure the values accordingly. This is usefull when you have multiple stages which needs multiple database tables

Optionally if you want to create the tables and run the seeds on dynamodb starts, use the argument -c or add the "create": true inside s-project.json as shown below

```json
"custom": {
  "dynamodb": {
    "start": {
      "create": true
    }
  }
}
```

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
Open a browser and go to the url http://localhost:8000/shell to access the web shell for dynamodb local

Note: Default port: 8000 and if you change the port, change it accordingly in usage

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
* Make a "plugins" folder in the root of your Project and copy this codebase into it. Title it your custom plugin name with the suffix "-dev", like "serverless-dynamodb-local-dev"
* Go to root of your Project and edit the s-project.json and add
```
"plugins": [
"serverless-dynamodb-local-dev"
]
```
* Open a commandline from your root Project folder and Start a new dynamodb instance by running 
```
sls dynamodb start
```
* Go to dynamodb local [shell](http://localhost:8000/shell) in your browser and you should be able to see use the web shell

## Credits

Bunch of thanks to doapp-ryanp who started [dynamodb-local](https://github.com/doapp-ryanp/dynamodb-local) project