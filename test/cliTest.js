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

describe("command line options",function(){
  describe("for 'start' command",function(){
    let service;
    before(function(){
      this.timeout(60000);
      service = new Plugin(serverlessMock, { port: 8123, host: "home.local" });
      //return service.startHandler();
    });

    it(".port should return cli option",function(){
      assert.equal(service.port, 8123);
    });
    
    it(".host should return cli option",function(){
      assert.equal(service.host, "home.local");
    });
  });
});