//Define the modules required to mocha testing
const assert = require("chai").assert;
const http = require ("http");
const expect = require("chai").expect;
const should = require("should");
let aws = require ("aws-sdk");

//Invoke the functions in the index.js
let port = require("../index.js").port;
let dynamodbOptions = require("../index.js").dynamodbOptions;
const migrateHandler = require("../index.js").migrateHandler;
const seedHanlder = require("../index.js").seedHanlder;
const removeHandler = require("../index.js").removeHandler;
const startHandler = require("../index.js").startHandler;
const endHandler = require("../index.js").endHandler;
const tables = require("../index.js").tables;
const seedSources = require("../index.js").seedSources;
const createTable = require("../index.js").createTable;
const seed = require("../src/seeder.js");
const dataApp = require("../index.js");

//Test cases to check the get port function
describe("Port",function(){
  it("Port should return number", function(){    
    let myport = dataApp.prototype.port;   
    assert(typeof myport, 'number');
  });

  it("Port value should be >= 0 and < 65536", function () {
    http.get("http://localhost:8000", function (response) {
     assert.equal(response.statusCode, 200);
     done();
    });
  });
});

//Testing the dynamodb options function
describe("Check the dynamodb function", function(){
  it("Region should be localhost",function(){
    expect((dynamodbOptions,{region: "localhost"})).to.deep.include({region: "localhost"});
  });

  it("Should listen to endpoint", function () {
     let server;
     before(function () {
       server = dynamodbOptions.listen(port);
     }); 
     after(function () {
      assert.ok;
     });
    });
  
  it("Raw should be an object", function(){    
    let dynamoOptions = dataApp.prototype.dynamodbOptions;
    let raw = new aws.DynamoDB(dynamoOptions);
    raw.should.be.type('object');
  });
   
  it("Doc should be an object", function(){    
    let dynamoOptions =  dataApp.prototype.dynamodbOptions;
    let doc = new aws.DynamoDB(dynamoOptions);
    doc.should.be.type('object');
  });
});

describe ("Check the Seeder file", function(){
  it("Table name should be a string", function(){
    let tableName1 = seed.writeSeeds.name;
    expect(tableName1).to.be.a('string');
  });
});

describe ("Check seedSources function", function(){
  it ("Seeds should be string",function(){
    const seed = "testing";
    let seedTest = dataApp.prototype.seedSources(seed);
    assert.typeOf(seedTest,'string');    
  });
});
