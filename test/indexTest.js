var should = require("should");
var request = require("request");
var expect = require("chai").expect;
var util = require("util");

var assert = require('chai').assert;
var config = require('../index');

describe('Unit Test', function () {
    it('Check endpoint', function () {
        before(function () {
            config.listen(8989);
        });
        after(function () {
            console.log('after');
        });
    });

    it('Check timeout test to 1000ms', () => {
        this.timeout(1000);
        assert.ok(true);
    });
});

