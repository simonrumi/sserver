'use strict';

var request = require('request');
var jsonFileParser = require('jsonfile');
var expressApp = require('../../app.js');
var endpointHelper = require('../../routes/json-endpoint-helper');
var updateHelper = require('../../routes/update-helper');

var BASE_URL = 'http://localhost:3000/';

(function () {
    describe('Make an ajax get call', function() {
		it('should return the contents of row 0, cell 0', function() {
            request.get(BASE_URL + 'db.json/rows/0/cells/0/contents', function(error, response, body) {
                expect(false).toEqual('this should fail');
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

            it('should get the endpoint after the json file from a path', function() {
                expect(endpointHelper.getEndpointFromPath(jsonPath)).toBe('/followed/by/more/stuff');
            });
        });

        describe('Traversing a path to an endpoint within a json object', function() {
            var arr = ['first', 'second', 'third'];
            var obj = {'parent': {'child': arr} };

            it('should return a string nested within the json object, based on the endpoint path', function() {
                var endpoint = '/parent/child/1';
                expect(endpointHelper.getJsonAtEndpoint(obj, endpoint)).toBe('second');
            });

            it('should return an array nested within the json object, based on the endpoint path', function() {
                var endpoint = '/parent/child';
                expect(endpointHelper.getJsonAtEndpoint(obj, endpoint)).toBe(arr);
            });

            it('should thow an exception if there is no object at the given endpoint path', function() {
                var endpoint = '/parent/noexistant';
                expect(endpointHelper.getJsonAtEndpoint.bind(null, obj, endpoint)).toThrow();
            });

            it('should thow an exception if there is no array element at the given endpoint path', function() {
                var endpoint = '/parent/child/99';
                expect(endpointHelper.getJsonAtEndpoint.bind(null, obj, endpoint)).toThrow();
            });
        });
    });

    describe('Test helper files for the Update handler', function() {
        it('should write to a JSON file', function() {
            var resultingContent;
            var file = 'test.json';
            var newContent = {'name': 'test file', 'value': 'this is some test content'};
            var callback = function() {};
            var callingObject = {currentJsonFile : file}

            expect(updateHelper.writeToJsonFile.bind(callingObject, newContent, callback)).not.toThrow();
            jsonFileParser.readFile(file, function(err, contents) {
                if (!err) {
                    resultingContent = contents;
                } else {
                    console.log(err);
                }
                expect(resultingContent.toEqual(newContent));
            });
        });
    });

    describe('Posting and updating', function() {
        var that = this;
        var jsonFile = 'db.json';
        var newContent = 'this is new content';
        var endpointPath = 'rows/0/cells/0/contents';

        var updateQuery = {
            content: newContent,
            'json-file': jsonFile,
            endpoint: endpointPath
        };
        var options = {
            uri: BASE_URL + 'update',
            method: 'POST',
            json: true,
            body: updateQuery,
        };

        it('should update a field, within the .json file, with a string', function() {
            var updatedContents;
            request(options, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
                jsonFileParser.readFile(jsonFile, function(err, contents) {
                    updatedContents = endpointHelper.getJsonAtEndpoint(contents, that.endpointPath);
                    expect(updatedContents).toEqual(that.newContent);
                });
            });
        });

        it('should throw an error when trying to update a field that does not exist within the .json file', function() {
            updateQuery.endpoint = 'bad/path';
            options.body = updateQuery;
            request(options, function(error, response, body) {
                expect(response.statusMessage).toContain('Could not update');
                expect(error).toEqual('what is the error for updating a nonexistant field?');
                expect(response.statusCode).toBe(400);
                done();
            });
        });

        it('should throw an error when trying to update a non-existant .json file', function() {
            updateQuery['json-file'] = 'nonexistant.json';
            options.body = updateQuery;
            request(options, function(error, response, body) {
                expect(response.statusMessage).toContain('Could not update');
                expect(error).toEqual('what is the error for updating a nonexistant json file?');
                expect(response.statusCode).toBe(400);
                done();
            });
        });

        it('should throw an error when trying to update an empty .json file', function() {
            updateQuery['json-file'] = 'empty.json';
            options.body = updateQuery;
            request(options, function(error, response, body) {
                expect(response.statusMessage).toContain('Could not update');
                expect(error).toEqual('what is the error for updating an empty json file?');
                expect(response.statusCode).toBe(400);
                done();
            });
        });

        it('should prevent an update when the json file is locked', function() {
            updateHelper.lockJson(jsonFile);

            updateQuery['json-file'] = jsonFile;
            updateQuery.endpoint = endpointPath;
            options.body = updateQuery;

            request(options, function(error, response, body) {
                expect(response.statusMessage).toContain('Could not update');
                expect(error).toEqual('what is the error for updating a locked json file?');
                expect(response.statusCode).toBe(400);
                done();
            });
        });
    });


})();
