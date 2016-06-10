# Serverless plugin

# Development Setup

#Create a new serverless project
#Inside the project root create a folder called plugins
#Inside checkout the source from this repository
   /plugins/serverless-dynamodb-local
#Go to root and edit the s-project.json and add
   "plugins": [
    "serverless-dynamodb-local"
    ]
#Type the command sls and you should be seeing the launch function which can be executed with port (-p) parameter
#Launch a new dynamodb instance by running sls dynamodb launch -p 8000
#Go to http://localhost:8000/shell and you should see the dynamodb local web console

Note: Check the issues to see things to do list for the initial development