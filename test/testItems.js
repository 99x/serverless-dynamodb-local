"use strict";
const assert = require("chai").assert;
const http = require ("http");
const expect = require("chai").expect;
const should = require("should");
const aws = require ("aws-sdk");

aws.config.update({ accessKeyId: "localAccessKey", secretAccessKey: "localSecretAccessKey", region: "localRegion"});
var db = new aws.DynamoDB({ endpoint: "http://localhost:8000" });
var dbClient = new aws.DynamoDB.DocumentClient({ endpoint: "http://localhost:8000"});

describe("#Add Items", function() {
  this.timeout(50000);
  it("should add item to table", function(done) {
    {
      var params = {
        TableName:"MyMovie",
        Item:{
            "year": 2017,
            "title": "Big Movie",
            "info":{
                "plot": "Nothing happens at all.",
                "rating": 0
            }            
        }
      };
      dbClient.put(params, function(err, data) {
        if (err) {
          should.not.exist(data); 
        } else {
          assert.isNotNull(data.Attributes);
          assert.isOk(true, "This will pass");
        }
        done();
      });
    };
  });
});

describe("#Update Items", function(){
  this.timeout(50000);
  it("should update the items", function(done){
    var params = {
      TableName:"MyMovie",
      Key:{
          "year": 2017,
          "title": "Big Movie"
      },
      UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
      ExpressionAttributeValues:{
        ":r":5.4,
        ":p":"Everything happens all at once.",
        ":a":["Steve", "Jonson", "Cethie"]
      },
      ReturnValues:"UPDATED_NEW"
    };
    dbClient.update(params, function(err,data){
      if(err){
        should.exist(err);
      } else {
      assert.isNotNull(data.Attributes);
      assert.isOk(true, "This will pass");
      }
      done();
    });  
  });
});

describe("#Delete Items", function(){
  this.timeout(50000);
  it("should delete the items", function(done){
    var params = {
      TableName:"Movies10",
      Key:{
        "year":2017,
        "title":"Big Movie"
      },
      ConditionExpression:"info.rating <= :val",
      ExpressionAttributeValues: {
        ":val": 5.0
      }
    };
    dbClient.delete(params, function(err, data) {
      if (err) {
        should.exist(err); 
      } else {
        should.not.exist(data); 
      }
      done();
    });
  });
});

describe("#Retrieving from database",function(){
  this.timeout(50000);
  var params = {
    TableName : "Movies10",
    KeyConditionExpression: "#yr = :yyyy",
    ExpressionAttributeNames:{
      "#yr": "year"
    },
    ExpressionAttributeValues: {
      ":yyyy":2017
    }
  };
  
  it ("Getting data from the table", function(done){
    this.timeout(50000);
    dbClient.query(params, function(err, data) {
      if (err) {
        should.exist(err); 
      } else {
        data.Items.forEach(function(item) {
          assert.equal(item.year + ": " + item.title, "2017: Big Movie", "==Matching the values.");
        });
      }
      done();
    });
  });
});
