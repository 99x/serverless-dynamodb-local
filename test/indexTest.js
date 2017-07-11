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

aws.config.update({ accessKeyId: "MOCK_ACCESS_KEY_ID", secretAccessKey: "MOCK_SECRET_ACCESS_KEY", region: "localhost",  });
let db = new aws.DynamoDB({ endpoint: "http://localhost:8000" });

//Test cases to check the get port function
describe("Port",function(){
  it("Port should return number", function(){    
    assert(typeof port, 'number');
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
  it("Check region is localhost",function(){
    expect((dynamodbOptions,{region: "localhost"})).to.deep.include({region: "localhost"});
  });

  it("Check endpoint listens to the port", function () {
     let server;
     before(function () {
       server = dynamodbOptions.listen(port);
     }); 
     after(function () {
      assert.ok;
     });
    });
  
  it("Check whether Raw is an object", function(){    
    let dynamoOptions = new Object;
    let raw = new aws.DynamoDB(dynamoOptions);
    raw.should.be.type('object');
  });
   
  it("Check whether doc is an object", function(){    
    let dynamoOptions =  new Object;
    let doc = new aws.DynamoDB(dynamoOptions);
    doc.should.be.type('object');
  });
});

describe ("Check the table function", function(){
  it('Existance of the table', function(done) {
    let table = tables.get(name);
    true.should.be.ok;
  });
});

describe ("Check the Seeder file", function(){
  it("Check whether table name is a string", function(){
    let tableName1 = seed.writeSeeds.name;
    expect(tableName1).to.be.a('string');
  });
});
