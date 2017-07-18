//Define the modules required to mocha testing
const assert = require("chai").assert;
const http = require ("http");
const expect = require("chai").expect;
const should = require("should");
const aws = require ("aws-sdk");
const dynamodbLocal = require("../index.js");

aws.config.update({ accessKeyId: "localAccessKey", secretAccessKey: "localSecretAccessKey", region: "localRegion"});
var db = new aws.DynamoDB({ endpoint: 'http://localhost:8000' });

describe("Check Table operations", function() {
  describe("#create table", function() {
    it("should create a table if not existing", function(done) {
      var params = {
      TableName : "Movies",
      KeySchema: [       
          { AttributeName: "year", KeyType: "HASH"},  //Partition key
          { AttributeName: "title", KeyType: "RANGE" }  //Sort key
      ],
      AttributeDefinitions: [       
          { AttributeName: "year", AttributeType: "N" },
          { AttributeName: "title", AttributeType: "S" },
          { AttributeName: "info", AttributeType: "S"}
      ],
      ProvisionedThroughput: {       
          ReadCapacityUnits: 1, 
          WriteCapacityUnits: 1
        }
      };

      var create = db.createTable(params, function(err, data) {
        if (err) {
           should.not.exist(err);
        } else {
           should.exist(data); 
           data.TableDescription.should.have.property("TableName","Movies");
           assert.isNumber(data.TableDescription.ProvisionedThroughput.WriteCapacityUnits);

        }
        done();
        }); 
    });
  });

  describe("#delete table", function(){
    it("should delete the table", function(done){
      var params = {"TableName":"Movies"};
      
      db.deleteTable(params,function(err,data){
        if (err){
          should.not.exist(err);
          assert.isNull(data);
        } else {
          should.exist(data);
        }
        done();
      });
    });
  });

  describe("#update table", function(){
    it("should update the table", function(done){
      var params = {
          "AttributeDefinitions": [ 
              { 
                "AttributeName": "batch",
                "AttributeType": "N"
              }
          ],   
          "ProvisionedThroughput": { 
              "ReadCapacityUnits": 10,
              "WriteCapacityUnits": 10
          },
          "TableName": "Movies"
        }
 
    db.updateTable(params,function(err,data){
        if (err){
            should.not.exist(data);
        } else {
            data.TableDescription.should.have.property("TableName","Movies");
            should.exist(data);
        }
        done();
      });
    });
  });
  describe("queue-handler", function() {
    it("should connect to dynamodb and list tables", function(done) {
      db.listTables({}, function(err, data) {
        if(err){
            should.exist(err);
        } else {
            should.not.exist(data);
        }
        done();     
        });
    });
  });

  describe("#getItems", function() {
    var tableDes = db.getItem({"TableName": "Movies"})
    it("Retrieve hostname from created tables", function() {
      assert.equal(tableDes.httpRequest.endpoint.hostname,"localhost");
    });
    
    it("Retrieves the path of the table",function(){
      assert.equal(tableDes.httpRequest.path, "/");
    });
  });
});
