serverless-dynamodb-local (beta)
=================================
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-dynamodb-local.svg)](https://badge.fury.io/js/serverless-dynamodb-local)
[![license](https://img.shields.io/npm/l/serverless-dynamodb-local.svg)](https://www.npmjs.com/package/serverless-dynamodb-local)

This Serverless 0.5.x plugin help you to setup dynamodb local instance with much needed features to setup your serverless local development environment.
You can use this with ['serverless-offline'](https://github.com/dherault/serverless-offline) Plugin.

## Features

* Automatically downloads dynamodb local
* Provide you with a set of serverless commands for dynamodb local (e.g launch, stop, relaunch)
* Allow to specify all the supported commands in dynamodb local (e.g port, inMemory, sharedDb)

## Installation

`npm install serverless-dynamodb-local`
Then in `s-project.json` add following entry to the plugins array: `serverless-dynamodb-local`
Like this: `"plugins": ["serverless-dynamodb-local"]`

## Usage and command line options

In your project root run:
`sls dynamodb launch`
All CLI options are optional:
```
--port                  -P  Port to listen on. Default: 8000
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
Note: Default port: 8000
```



## RoadMap

* Allow you to setup dynamodb tables creation scripts, innside your project and enables to execute them locally as well as remotely with a simple set of commands
* Similar to dynamodb table creation scripts, it also allows to setup your dynamodb data seeds for both local and remote
* Provides the ability to setup your local development environment with the support of ['serverless-offline'](https://github.com/dherault/serverless-offline) Plugin
* A fantastic and welcoming community!

## Links

* [Dynamodb local documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
* [Contact Us](mailto:ashanf@99x.lk)

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
* Open a commandline from your root Project folder and Launch a new dynamodb instance by running 
```
sls dynamodb launch -p 8000 // Note: there are more parameters in the list
```
* Go to [shell](http://localhost:8000/shell) in your browser and you should be able to see use the web shell

## Credits
Bunch of thanks to doapp-ryanp who started [dynamodb-local](https://github.com/doapp-ryanp/dynamodb-local) project