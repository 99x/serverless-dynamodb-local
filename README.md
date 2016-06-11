# serverless-dynamodb-local
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

This Serverless 0.5.x plugin help you to setup dynamodb local instance with much needed features to setup your serverless local development environment.
You can use this with ['serverless-offline'](https://github.com/dherault/serverless-offline) Plugin.

* To install the plugin
  ```
  npm install serverless-dynamodb-local // Note: Yet to be added to npm registry
  ```

# Overview

Need your help to write this content ... Parameter [reference](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) 

# Contributing

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