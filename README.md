serverless-dynamodb-local
=================================

[![Join the chat at https://gitter.im/99xt/serverless-dynamodb-local](https://badges.gitter.im/99xt/serverless-dynamodb-local.svg)](https://gitter.im/99xt/serverless-dynamodb-local?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-dynamodb-local.svg)](https://badge.fury.io/js/serverless-dynamodb-local)
[![license](https://img.shields.io/npm/l/serverless-dynamodb-local.svg)](https://www.npmjs.com/package/serverless-dynamodb-local)

## This Plugin Requires
* serverless@v1-rc.1
* Java Runtime Engine (JRE) version 6.x or newer

## Features
* Install DynamoDB Local
* Start DynamoDB Local with all the parameters supported (e.g port, inMemory, sharedDb)
* Create, Manage and Execute DynamoDB Migration Scripts(Table Creation/ Data Seeds) for DynamoDB Local and Online

## Install Plugin
`npm install --save serverless-dynamodb-local`

Then in `serverless.yml` add following entry to the plugins array: `serverless-dynamodb-local`
```yml
plugins:
  - serverless-dynamodb-local
```

## Using the Plugin
1) Install DynamoDB Local
`sls dynamodb install`

2) Start DynamoDB Local (DynamoDB will process incoming requests until you stop it. To stop DynamoDB, type Ctrl+C in the command prompt window). Make sure above command is executed before this.
`sls dynamodb start`

3) Create/Execute DynamoDB (Migrations)
* Create a new migration file (Default directory path /dynamodb). Make sure DynamoDB Local is started in another shell.
`sls dynamodb create -n <filename>`

* Execute a single migration. Make sure DynamoDB Local is started in another shell.
`sls dynamodb execute -n <filename>`

* Execute all migrations for DynamoDB Local.
`sls dynamodb executeAll`

Note: Read the detailed section for more information on advanced options and configurations. Open a browser and go to the url http://localhost:8000/shell to access the web shell for dynamodb local.

## Install: sls dynamodb install
To remove the installed dynamodb local, run:
`sls dynamodb remove`
Note: This is useful if the sls dynamodb install failed in between to completely remove and install a new copy of DynamoDB local.

## Start: sls dynamodb start
All CLI options are optional:

```
--port  		  -p  Port to listen on. Default: 8000
--cors                    -c  Enable CORS support (cross-origin resource sharing) for JavaScript. You must provide a comma-separated "allow" list of specific domains. The default setting for -cors is an asterisk (*), which allows public access.
--inMemory                -i  DynamoDB; will run in memory, instead of using a database file. When you stop DynamoDB;, none of the data will be saved. Note that you cannot specify both -dbPath and -inMemory at once.
--dbPath                  -d  The directory where DynamoDB will write its database file. If you do not specify this option, the file will be written to the current directory. Note that you cannot specify both -dbPath and -inMemory at once. For the path, current working directory is <projectroot>/node_modules/serverless-dynamodb-local/dynamob. For example to create <projectroot>/node_modules/serverless-dynamodb-local/dynamob/<mypath> you should specify -d <mypath>/ or --dbPath <mypath>/ with a forwardslash at the end.
--sharedDb                -h  DynamoDB will use a single database file, instead of using separate files for each credential and region. If you specify -sharedDb, all DynamoDB clients will interact with the same set of tables regardless of their region and credential configuration.
--delayTransientStatuses  -t  Causes DynamoDB to introduce delays for certain operations. DynamoDB can perform some tasks almost instantaneously, such as create/update/delete operations on tables and indexes; however, the actual DynamoDB service requires more time for these tasks. Setting this parameter helps DynamoDB simulate the behavior of the Amazon DynamoDB web service more closely. (Currently, this parameter introduces delays only for global secondary indexes that are in either CREATING or DELETING status.)
--optimizeDbBeforeStartup -o  Optimizes the underlying database tables before starting up DynamoDB on your computer. You must also specify -dbPath when you use this parameter.
--migration               -m  After starting dynamodb local, run dynamodb migrations.
```

All the above options can be added to serverless.yml to set default configuration: e.g

```yml
custom:
  dynamodb:
    start:
      port: 8000
      inMemory: true
      migration: true
    migration:
      dir: ./offline/migrations
```

##  Migrations: sls dynamodb create/execute/executeAll
### Configurations
In `serverless.yml` add following to customize DynamoDB Migrations file directory and table prefixes/suffixes
```yml
custom:
  dynamodb:
    migration:
      dir: dynamodbMigrations
        table_prefix: prefix
        table_suffix": suffix
```

In `serverless.yml` add following to execute all the migration upon DynamoDB Local Start
```yml
custom:
  dynamodb:
    start:
      migration: true
```
### Migration Template
```json
{
    "Table": {
        "TableName": "TableName",
        "KeySchema": [{
            "AttributeName": "attr_1",
            "KeyType": "HASH"
		}, {
            "AttributeName": "attr_2",
            "KeyType": "RANGE"
		}],
        "AttributeDefinitions": [{
            "AttributeName": "attr_1",
            "AttributeType": "S"
		}, {
            "AttributeName": "attr_2",
            "AttributeType": "S"
		}],
        "LocalSecondaryIndexes": [{
            "IndexName": "local_index_1",
            "KeySchema": [{
                "AttributeName": "attr_1",
                "KeyType": "HASH"
			}, {
                "AttributeName": "attr_2",
                "KeyType": "RANGE"
			}],
            "Projection": {
                "NonKeyAttributes": ["attr_1", "attr_2"],
                "ProjectionType": "INCLUDE"
            }
		}],
        "GlobalSecondaryIndexes": [{
            "IndexName": "global_index_1",
            "KeySchema": [{
                "AttributeName": "attr_1",
                "KeyType": "HASH"
			}, {
                "AttributeName": "attr_2",
                "KeyType": "RANGE"
			}],
            "Projection": {
                "NonKeyAttributes": ["attr_1", "attr_2"],
                "ProjectionType": "INCLUDE"
            },
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1
            }
		}],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1
        }
    },
    "Seeds": [{
        "attr_1": "attr_1_value",
        "attr_2": "attr_2_value"
    }]
}
```
Before modifying the migration template, refer the (Dynamodb Client SDK): http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property and (Dynamodb Document Client SDK): http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property links.

## Using DynamoDB Local in your code
You need to add the following parameters to the AWS NODE SDK dynamodb constructor

e.g. for dynamodb document client sdk
```
var AWS = require('aws-sdk');
```
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

### Using with serverless-offline plugin
When using this plugin with serverless-offline, it is difficult to use above syntax since the code should use DynamoDB Local for development, and use DynamoDB Online after provisioning in AWS. Therefore we suggest you to use [serverless-dynamodb-client](https://github.com/99xt/serverless-dynamodb-client) plugin in your code.

## Links
* [Dynamodb local documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
* [Contact Us](mailto:ashanf@99x.lk)
* [NPM Registry](https://www.npmjs.com/package/serverless-dynamodb-local)

## License
  [MIT](LICENSE)
