'use strict';

var jsonFileParser = require('jsonfile');

var jsonEndpointHelper = {
	regex : {
		matchFilenameDotJson: /\w+\.json/i,
		matchPathAfterJsonFile: /\w+\.json(.*)/i,
	},
	
	serveJson : function(request, response) {
		var endpoint;
		var endpointObj;
		var helper = this;
		var jsonFile = helper.findJsonFileInPath(request.path);
		if (jsonFile) {
			jsonFileParser.readFile(jsonFile, function(err, contents) {
				if (!err) {
					endpoint = helper.getEndpointFromPath(request.path);
					console.log('serveFile, json file: ' + jsonFile + ', endpoint: ' + endpoint);
					try {
						endpointObj = helper.getJsonAtEndpoint(contents, endpoint);
						response.json(endpointObj);
						response.end();
					} catch (err2) {
						helper.displayError(err2, response);
					}
				} else {
					helper.displayError(err, response);
				}
			});
		} else {
			errStr = 'No json file found; request path was' + request.path;
			helper.displayError(errStr, response);
		}
	},
	
	findJsonFileInPath : function(path) {
		return this.getLastMatch(path, this.regex.matchFilenameDotJson);
	},
	
	getEndpointFromPath : function(path) {
		return this.getLastMatch(path, this.regex.matchPathAfterJsonFile);
	},
	
	getJsonAtEndpoint : function(jsonObj, endpoint) {
		var i;
		var childObj;
		var endpointObject = jsonObj;
		var endpointParts = endpoint.split('/');
		console.log('getJsonAtEndpoint: endpointParts = ' + endpointParts);
		for (i in endpointParts) {
			if (endpointParts[i]) {
				endpointObject = endpointObject[endpointParts[i]];
				if (endpointObject === undefined) {
					throw 'Invalid path, object not found for endpoint ' + endpoint;
				}
			}
		}
		console.log('endpointObject is now: ' + JSON.stringify(endpointObject,null,3));
		return endpointObject;
	},
		
	/*
	* Note that getting the last match from a regex str.match() means that we will get either  
	*  - the contents of the last set of parentheses, if there are any parentheses in the pattern
	*  - otherwise the last match if a global /g is used in the pattern
	*  - otherwise the first and only match reported
	*/
	getLastMatch : function(string, pattern) {
		var match = '';
		var arrayFromPatternMatch = string.match(pattern);
		if (arrayFromPatternMatch && arrayFromPatternMatch.length > 0) {
			match = arrayFromPatternMatch[arrayFromPatternMatch.length-1];
		}
		return match;
	},
	
	displayError : function(err, response) {
		console.log(err);
		response.writeHead(404);
		response.end(err);
	},				
	
	//TODO - put in a locking system, so that any writes will block anyone else from writing
	// apparently MongoDb also blocks readers, but seems like we wouldn't need to do that
	// if someone reads data that is out of date, well it would have been out of date if they
	// did the read miliseconds before, when the write hadn't started
	updateJson : function(request, response) {
		var i;
		var errStr;
		var endpointParts;
		var helper = this;
		var jsonFile = request.body['json-file']; 
		var updateEndpoint = request.body['endpoint'];
		var newContent = request.body['content'];
		console.log('updateJson: jsonFile = ' + jsonFile + ', updateEndpoint = ' + updateEndpoint + 'newContent = ' + newContent);
		
		if (jsonFile) {
			jsonFileParser.readFile(jsonFile, function(err, contents) {
				console.log('updateJson: read jsonFile and got contents: ' + JSON.stringify(contents));
				endpointParts = updateEndpoint.split('/');
				contents = helper.updateJsonAtEndpoint(endpointParts, contents, newContent);
				console.log('\n updateJson: updated json to: ' + JSON.stringify(contents));
				try {
					helper.writeToJsonFile(jsonFile,contents);	
					response.writeHead(200);
					// response.end('<p>update completed:</p><p>' + JSON.stringify(contents,null,3) + '</p>');
					response.end(JSON.stringify(contents,null,3));
				} catch (err2) {
					displayError(err2, response);
				}
				
			});
			// QQQQQQQQQQ better than the fs thing above would be to deal with streams or promises or something
		} else {
			errStr = 'No json file found:' + jsonFile;
			displayError(errStr, response);
		}
	},
	
	updateJsonAtEndpoint : function(endpointPathParts, jsonObj, newContent) {
		var objectKey;
		var childObj;
		if (endpointPathParts.length === 1) {
			jsonObj[endpointPathParts[0]] = newContent; // we've reached the end of the endpoint path, so it's time to put in the newContent
			return jsonObj;
		} else {
			objectKey = endpointPathParts.shift(); // the current key is the first element in the array
			childObj = jsonObj[objectKey]; // use that key to get the childObj we're interested in
			childObj = this.updateJsonAtEndpoint(endpointPathParts, childObj, newContent); // recursively update the childObj
			jsonObj[objectKey] = childObj; // assign the updated childObj to the spot we got it from in the parent object
			return jsonObj;
		}
	},
	
	writeToJsonFile : function(jsonFile, newContent) {
		console.log('writeToJsonFile: jsonFile=' + jsonFile + ', newContent=' + JSON.stringify(newContent));
		jsonFileParser.writeFile(jsonFile, newContent, function(err) {
			if (!err) {
				console.log('writeToJsonFile: writing jsonFile wihtout error');
				return true;
			} else {
				throw('Could not write to file ' + jsonfile + ' : ' + err);
			}
		});
	},
};

module.exports = jsonEndpointHelper;

