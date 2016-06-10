# Serverless plugin

# Development Setup
1) Create a new serverless project
2) Inside the project root create a folder called plugins
3) Inside checkout the source from this repository
   /plugins/serverless-dynamodb-local
4) Go to root and edit the s-project.json and add
   "plugins": [
    "serverless-dynamodb-local"
    ]
5) Type the command sls and you should be seeing the launch function which can be executed with port (-p) parameter
6) Launch a new dynamodb instance by running sls dynamodb launch -p 8000
7) Go to http://localhost:8000/shell and you should see the dynamodb local web console

Note: Check the issues to see things to do list for the initial development