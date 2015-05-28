/* 
* getting started with jasmine-node, refer to this
* https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-jasmine
*/
'use strict';

var request = require('request');
var expressApp = require('../../app.js');
var baseUrl = 'http://localhost:3000/';

(function () {
    describe('Make an ajax get call', function () {    	
		it('should return the contents of row 0, cell 0', function () {
            request.get(baseUrl + 'db.json/rows/0/cells/0/contents', function(error, response, body) {
                expect(body).toEqual('foo');
                expect(response.statusCode).toBe(200);
                done();
            });
		});
    });
})();
