'use strict';

var jsonEndpointHelper = {
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
	
	regex : {
		matchFilenameDotJson: /\w+\.json/i,
		matchPathAfterJsonFile: /\w+\.json(.*)/i,
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
		response.writeHead(400);
		response.statusMessage = err;
		response.end(err);
	},				
	
	
};

module.exports = jsonEndpointHelper;

