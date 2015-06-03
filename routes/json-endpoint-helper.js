'use strict';

var jsonFileParser = require('jsonfile');

var jsonEndpointHelper = {
	regex : {
		matchFilenameDotJson: /\w+\.json/i,
		matchPathAfterJsonFile: /\w+\.json(.*)/i,
		matchUpdatePath: /update.*\w+\.json(.*)/i,
	},
	
	findJsonFileInPath : function(path) {
		return this.getLastMatch(path, this.regex.matchFilenameDotJson);
	},
	
	serveJson : function(jsonFile, request, response) {
		var endpoint;
		var endpointObj;
		var helper = this;
		if (jsonFile) {
			jsonFileParser.readFile(jsonFile, function(err, contents) {
				if (!err) {
					endpoint = helper.getJsonEndpoint(request.path);
					console.log('serveFile, json file: ' + jsonFile + ', endpoint: ' + endpoint);
					endpointObj = helper.traverseJsonToEndpoint(contents, endpoint);
					response.json(endpointObj);
				} else {
					console.log(err);
					response.writeHead(404);
					response.end(err);
				}
			});
		} else {
			errStr = 'No json file found; request path was' + request.path;
			console.log(errStr);
			response.writeHead(404);
			response.end(errStr);
		}
	},
	
	getJsonEndpoint : function(path) {
		return this.getLastMatch(path, this.regex.matchPathAfterJsonFile);
	},
	
	traverseJsonToEndpoint : function(jsonObj, endpoint) {
		var i;
		var childObj;
		var endpointObject = jsonObj;
		var endpointParts = endpoint.split('/');
		console.log('endpointParts = ' + endpointParts);
		for (i in endpointParts) {
			if (endpointParts[i]) {
				childObj = this.tryAsArrayIndex(endpointParts[i], endpointObject);
				if (!childObj) {
					childObj = this.tryAsKey(endpointParts[i], endpointObject);
				}
				if (childObj) {
					endpointObject = childObj;
				}
			}
		}
		console.log('endpointObject is now: ' + JSON.stringify(endpointObject,null,3));
		return childObj;
	},
	
	tryAsKey : function(key, object) {
		var value = object[key];
		try {
			if (value) {
				return value;
			} else {
				return false;
			}
		} catch (err) {
			console.log(key + ' was not a valid key for the given object; ' + err);
			return false;
		}
	},
	
	tryAsArrayIndex : function(indexStr, array) {
		var arrayElement;
		var arrayIndex = parseInt(indexStr);
		var value;
		
		if(!Array.isArray(array)) {
			return false;
		}
		
		if (!arrayIndex) {
			return false;
		}
		
		try {
			value = array[arrayIndex];
			if (value) {
				return value;
			} else {
				return false;
			}
		} catch (err) {
			console.log(arrayIndex + ' was not a valid array index; ' + err);
			return false;
		}
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
	
	updateJson : function(jsonFile, updatePath, request, response) {
		console.log('updateJson: jsonFile = ' + jsonFile + ', updatePath = ' + updatePath);
		var newContent;
		var helper = this;
		if (jsonFile) {
			jsonFileParser.readFile(jsonFile, function(err, contents) {
				helper.writeToJsonFile(jsonFile,contents);				
			});
			// QQQQQQQQQQ better than the fs thing above would be to deal with streams or promises or something
		} else {
			errStr = 'No json file found:' + jsonFile;
			console.log(errStr);
			response.writeHead(404);
			response.end(errStr);
		}
	},
	
	writeToJsonFile : function(jsonFile, newContent) {
		jsonFileParser.writeFile(jsonFile, newContent, function(err) {
			if (!err) {
				return true;
			} else {
				console.log(err);
				return false;
			}
		});
	},
	
	getUpdatePathAfterJsonFileName : function(path) {
		return this.getLastMatch(path, this.regex.matchUpdatePath);
	},
};

module.exports = jsonEndpointHelper;

