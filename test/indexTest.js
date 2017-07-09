var should = require("should");
var request = require("request");
var expect = require("chai").expect;
var util = require("util");
var http = require ("http");

var assert = require('chai').assert;

var config = require("../index").port
var seed = require("../src/seeder.js");

/*
var port = require("../index").port
var dynamodbOptions = require("../index").dynamodbOptions;
var migrateHandler = require("../index").migrateHandler;
var seedHanlder = require("../index").seedHanlder;
var removeHandler = require("../index").removeHandler;
var startHandler = require("../index").startHandler;
var endHandler = require("../index").endHandler;
var tables = require("../index").tables;
var seedSources = require("../index").seedSources;
var createTable = require("../index").createTable;
*/


describe("Unit Test", function () {
   
    it("Check the port", function () {
        port =(config, "start.port", 8000);
    });
    
    it("Check the port", function () {
        http.get("http://localhost:8000", function (response) {
                assert.equal(response.statusCode, 200);
                console.log(port)
                done();
        })
    });

    it("Check timeout test to 1000ms", () => {
        this.timeout(1000);
        assert.ok(true);
    });
});

/*
describe("Server status and Message", function () {
      it("status response should be equal 200", function (done) {
            http.get("http://localhost:8000", function (response) {
                  assert.equal(response.statusCode, 200);
                  done();
            });
       });
});
*/

describe("End point", function(){
       it("Check endpoint", function () {
        before(function () {
            config.listen(8000);
        });
        after(function () {
            console.log('after');
        });
    });

       it("dynamoOptions Check", function(){
            const dynamoOptions = {
            endpoint: `http://localhost:${this.port}`,
            region: "localhost",
            accessKeyId: "MOCK_ACCESS_KEY_ID",
            secretAccessKey: "MOCK_SECRET_ACCESS_KEY"
            };
       });
});

describe("migrateHandler Check", function(){
    it("migrateHandler check values", function(){
        const dynamodb = this.dynamodbOptions();
        const tables = this.tables;
        return BbPromise.each(tables, (table) => this.createTable(dynamodb, table));
    });
});
