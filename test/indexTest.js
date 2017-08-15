"use strict";
//Define the modules required to mocha testing
const assert = require("chai").assert;
const http = require ("http");
const expect = require("chai").expect;
const should = require("should");
const aws = require ("aws-sdk");
const seeder = require("../src/seeder.js");
const dataApp = require("../index.js");

describe("Port function",function(){
  it("Port should return number",function(){
    let myport = dataApp.prototype.port;
    assert(typeof myport, "number");
  });

  it("Port value should be >= 0 and < 65536",function () {
  http.get(`http://localhost:${dataApp.prototype.port}`, function (response) {
    assert.equal(response.statusCode, 200);
    });
  });
});

describe("Check the dynamodb function",function(){
  it("Endpoint should listen to the port",function () {
     let server;
     before(function () {
      server = dynamodbOptions.listen(port);
     });
     after(function () {
      assert.ok;
     });
    });

  it("Should be an object",function(){
    let dynamoOptions = dataApp.prototype.dynamodbOptions;
    let raw = new aws.DynamoDB(dynamoOptions);
    raw.should.be.type("object");
  });
  
  it("Should be an object",function(){
    let dynamoOptions =  dataApp.prototype.dynamodbOptions;
    let doc = new aws.DynamoDB(dynamoOptions);
    doc.should.be.type("object");
  });
});

describe ("Start handler function",function(){
  it ("Should not  be null",function(){
    let handler = dataApp.prototype.startHandler;
    assert(handler =! null);
  });
});


describe ("createTable functon",function(){
  it ("Should check as a function",function(){
    const tbl = dataApp.prototype.createTable;
    assert.equal(typeof tbl, "function");
  });
}); 

describe ("Check the Seeder file",function(){
  it("Table name shoud be a string",function(){
    let tblName = seeder.writeSeeds.name;
    expect(tblName).to.be.a("string");
  });
});
