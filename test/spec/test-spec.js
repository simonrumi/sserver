/* 
* getting started with jasmine-node, refer to this
* https://semaphoreci.com/community/tutorials/getting-started-with-node-js-and-jasmine
*/
'use strict';

var request = require('request');
var expressApp = require('../../app.js');
var endpointHelper = require('../../routes/json-endpoint-helper');
var baseUrl = 'http://localhost:3000/';

(function () {
    describe('Make an ajax get call', function() {    	
		it('should return the contents of row 0, cell 0', function() {
            request.get(baseUrl + 'db.json/rows/0/cells/0/contents', function(error, response, body) {
                expect(body).toEqual('foo');
                expect(response.statusCode).toBe(200);
                done();
            });
		});
    });
    
    describe('Test helper files for the Get handler', function() {
        var jsonPath = '/some/path/then/myFile.json/followed/by/more/stuff';
        
        describe('Matching parts of the path', function() {
            it('should get the last match from the given pattern', function() {
                var pattern = /\w+\.json/i;
                var globalMatchPattern = /\w+\.json/ig;
                var parenthesesPattern = /\w+(\.json)(.*)/i;
                var twoJsonFiles = '/some/path/first.json/followed/by/second.json/stuff';
                
                expect(endpointHelper.getLastMatch(jsonPath, pattern)).toBe('myFile.json');
                expect(endpointHelper.getLastMatch(twoJsonFiles, globalMatchPattern)).toBe('second.json');
                expect(endpointHelper.getLastMatch(jsonPath, parenthesesPattern)).toBe('/followed/by/more/stuff');
            });
            
            it('should find the json file in a path', function() {
                expect(endpointHelper.findJsonFileInPath(jsonPath)).toBe('myFile.json');
            });
            
            it('should get the endpoint after the json file within a path', function() {
                expect(endpointHelper.getJsonEndpoint(jsonPath)).toBe('/followed/by/more/stuff')
            });
        });
        
        describe('Getting a value from object with a key or index', function() {
            var obj = {'myKey' : 'myValue'};
            var arr = ['first value','second value', 'third value'];
            
            it('should return the value, given a key and an object', function() {
                expect(endpointHelper.tryAsKey('myKey',obj)).toBe('myValue');
            });
            
            it('should return false, if the key does not exist in the object', function() {
                expect(endpointHelper.tryAsKey('nonexistant',obj)).toBe(false);
            });
            
            it('should return the correct element, given an index and an array', function() {
                var indexStr = '1';
                expect(endpointHelper.tryAsArrayIndex(indexStr,arr)).toBe('second value');
            });
            
            it('should return false, if the index is out of range', function() {
                var indexStr = '4';
                expect(endpointHelper.tryAsArrayIndex(indexStr,arr)).toBe(false);
            });
            
            it('should return false, if the object is not an array', function() {
                var indexStr = '0';
                expect(endpointHelper.tryAsArrayIndex(indexStr,obj)).toBe(false);
            });
        });

         describe('Traversing a path to an endpoint within a json object', function() {
            var arr = ['first', 'second', 'third'];
            var obj = {'parent': {'child': arr} };
            
            it('should return a string nested within the json object, based on the endpoint path', function() {
                var endpoint = '/parent/child/1';
                expect(endpointHelper.traverseJsonToEndpoint(obj, endpoint)).toBe('second');
            });
            
            it('should return an array nested within the json object, based on the endpoint path', function() {
                var endpoint = '/parent/child';
                expect(endpointHelper.traverseJsonToEndpoint(obj, endpoint)).toBe(arr);
            });
            
            it('should return false if there is no object at the given endpoint path', function() {
                var endpoint = '/parent/noexistant';
                expect(endpointHelper.traverseJsonToEndpoint(obj, endpoint)).toBe(false);
            });
            
            it('should return false if there is no array element at the given endpoint path', function() {
                var endpoint = '/parent/child/99';
                expect(endpointHelper.traverseJsonToEndpoint(obj, endpoint)).toBe(false);
            });
         });
    });
})();
