"use strict";
//Define the modules required to mocha testing
const assert = require("chai").assert;
const aws = require("aws-sdk");
const dataApp = require("../index.js");
const expect = require("chai").expect;
const http = require("http");
const seeder = require("../src/seeder.js");
const should = require("should");

describe("Port function", function() {
  it("Port should return number", function() {
    assert(typeof dataApp.prototype.port, "number");
  });

  it("Port value should be >= 0 and < 65536", function() {
    assert(dataApp.prototype.port >= 0 && dataApp.prototype.port < 65536);
  });
});

describe("Check the dynamodb function", function() {
  it("Endpoint should listen to the port", function() {
    let server;
    before(function() {
      server = dynamodbOptions.listen(port);
    });
    after(function() {
      assert.ok;
    });
  });

  it("Should be an object", function() {
    let dynamoOptions = dataApp.prototype.dynamodbOptions;
    let raw = new aws.DynamoDB(dynamoOptions);
    raw.should.be.type("object");
  });

  it("Should be an object", function() {
    let dynamoOptions = dataApp.prototype.dynamodbOptions;
    let doc = new aws.DynamoDB(dynamoOptions);
    doc.should.be.type("object");
  });
});

describe("Start handler function", function() {
  it("Should not  be null", function() {
    let handler = dataApp.prototype.startHandler;
    assert((handler = !null));
  });
});

describe("createTable function", function() {
  it("Should check as a function", function() {
    const tbl = dataApp.prototype.createTable;
    assert.equal(typeof tbl, "function");
  });
});

describe("Check the Seeder file", function() {
  it("Table name should be a string", function() {
    let tblName = seeder.writeSeeds.name;
    expect(tblName).to.be.a("string");
  });
});
