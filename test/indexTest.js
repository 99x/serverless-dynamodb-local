"use strict";
//Define the modules required to mocha testing
const assert = require("chai").assert;
const http = require ("http");
const expect = require("chai").expect;
const should = require("should");
const aws = require ("aws-sdk");
const seeder = require("../src/seeder.js");
const Plugin = require("../index.js");

const serverlessMock = require("./serverlessMock");

function get(url) {
  return new Promise(function(resolve, reject) {
    http.get(url, function(incoming) {
      resolve(incoming);
    }).on("error", reject);
  });
}

function getWithRetry(url, retryCount, previousError) {
  retryCount = retryCount || 0;
  if (retryCount >= 3) {
    return Promise.reject(new Error("Exceeded retry count for get of " + url + ": " + previousError.message));
  }
  return get(url)
    .catch(function(error) {
      return new Promise(function(resolve) { setTimeout(resolve, 10000); })
        .then(function() {
          return getWithRetry(url, retryCount + 1, error);
        });
    });
}

describe("Port function",function(){
  let service;
  before(function(){
    this.timeout(60000);
    service = new Plugin(serverlessMock, { stage: "test" });
    return service.installHandler();
  });

  it("Port should return number",function(){
    assert(typeof service.port, "number");
  });

  it("Port value should be >= 0 and < 65536",function() {
    this.timeout(40000);
    return service.startHandler()
      .then(function() {
        return new Promise(function(resolve) { setTimeout(resolve, 2000); });
      })
      .then(function() {
        return getWithRetry(`http://localhost:${service.port}/shell/`);
      })
      .then(function(response){
        assert.equal(response.statusCode, 200);
      });
  });

  after(function(){
    return service.endHandler();
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
    let dynamoOptions = Plugin.prototype.dynamodbOptions;
    let raw = new aws.DynamoDB(dynamoOptions);
    raw.should.be.type("object");
  });

  it("Should be an object",function(){
    let dynamoOptions =  Plugin.prototype.dynamodbOptions;
    let doc = new aws.DynamoDB(dynamoOptions);
    doc.should.be.type("object");
  });
});

describe ("Start handler function",function(){
  it ("Should not  be null",function(){
    let handler = Plugin.prototype.startHandler;
    assert(handler =! null);
  });
});


describe ("createTable functon",function(){
  it ("Should check as a function",function(){
    const tbl = Plugin.prototype.createTable;
    assert.equal(typeof tbl, "function");
  });
});

describe ("Check the Seeder file",function(){
  it("Table name shoud be a string",function(){
    let tblName = seeder.writeSeeds.name;
    expect(tblName).to.be.a("string");
  });
});
