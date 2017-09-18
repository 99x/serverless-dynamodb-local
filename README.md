serverless-dynamodb-local
=================================

[![Join the chat at https://gitter.im/99xt/serverless-dynamodb-local](https://badges.gitter.im/99xt/serverless-dynamodb-local.svg)](https://gitter.im/99xt/serverless-dynamodb-local?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/serverless-dynamodb-local.svg)](https://badge.fury.io/js/serverless-dynamodb-local)
[![license](https://img.shields.io/npm/l/serverless-dynamodb-local.svg)](https://www.npmjs.com/package/serverless-dynamodb-local)

## This Plugin Requires
* serverless@v1-rc.1
* Java Runtime Engine (JRE) version 6.x or newer

## Features
* Install DynamoDB Local
* Start DynamoDB Local with all the parameters supported (e.g port, inMemory, sharedDb)
* Table Creation for DynamoDB Local

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

2) Add DynamoDB Resource definitions to your Serverless configuration, as defined here: https://serverless.com/framework/docs/providers/aws/guide/resources/#configuration

3) Start DynamoDB Local and migrate (DynamoDB will process incoming requests until you stop it. To stop DynamoDB, type Ctrl+C in the command prompt window). Make sure above command is executed before this.
`sls dynamodb start --migrate`


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
--migrate                 -m  After starting DynamoDB local, create DynamoDB tables from the Serverless configuration.
--seed                    -s  After starting and migrating dynamodb local, injects seed data into your tables. The --seed option determines which data categories to onload.
```

All the above options can be added to serverless.yml to set default configuration: e.g.

```yml
custom:
  dynamodb:
    start:
      port: 8000
      inMemory: true
      migrate: true
      seed: true
    # Uncomment only if you already have a DynamoDB running locally
    # noStart: true
```

##  Migrations: sls dynamodb migrate
### Configuration
In `serverless.yml` add following to execute all the migration upon DynamoDB Local Start
```yml
custom:
  dynamodb:
    start:
      migrate: true
```
### AWS::DynamoDB::Table Resource Template for serverless.yml
```yml
resources:
  Resources:
    usersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: usersTable
        AttributeDefinitions:
          - AttributeName: email
            AttributeType: S
        KeySchema:
          - AttributeName: email
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
```

**Note:**
DynamoDB local doesn't support TTL specification, therefore plugin will simply ignore ttl configuration from Cloudformation template.

## Seeding: sls dynamodb seed
### Configuration

In `serverless.yml` seeding categories are defined under `dynamodb.seed`.

If `dynamodb.start.seed` is true, then seeding is performed after table migrations.

```yml
dynamodb:
  start:
    seed: true

  seed:
    domain:
      sources:
        - table: domain-widgets
          sources: [./domainWidgets.json]
        - table: domain-fidgets
          sources: [./domainFidgets.json]
    test:
      sources:
        - table: users
          sources: [./fake-test-users.json]
        - table: subscriptions
          sources: [./fake-test-subscriptions.json]
```

```bash
> sls dynamodb seed --seed=domain,test
> sls dynamodb start --seed=domain,test
```

If seed config is set to true, your configuration will be seeded automatically on startup. You can also put the seed to false to prevent initial seeding to use manual seeding via cli.

```fake-test-users.json example
[
  {
    "id": "John",
    "name": "Doe",
  },
]
```

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

The `serverless dynamodb start` command can be triggered automatically when using `serverless-offline` plugin.
Please note that you still need to install DynamoDB Local first.

Add both plugins to your `serverless.yml` file:
```yaml
plugins:
  - serverless-dynamodb-local
  - serverless-offline
```

Make sure that `serverless-dynamodb-local` is above `serverless-offline` so it will be loaded earlier.

Now your local DynamoDB database will be automatically started before running `serverless offline`.

### Using with serverless-offline and serverless-webpack plugin
Run `serverless offline start`. In comparison with `serverless offline`, the `start` command will fire an `init` and a `end` lifecycle hook which is needed for serverless-offline and serverless-dynamodb-local to switch off both ressources. 

Add plugins to your `serverless.yml` file:
```yaml
plugins:
  - serverless-webpack
  - serverless-dynamodb-local
  - serverless-offline #serverless-offline needs to be last in the list
```

## Reference Project
* [serverless-react-boilerplate](https://github.com/99xt/serverless-react-boilerplate)

## Links
* [Dynamodb local documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
* [Contact Us](mailto:ashanf@99x.lk)
* [NPM Registry](https://www.npmjs.com/package/serverless-dynamodb-local)

## License
  [MIT](LICENSE)
