'use strict';

var express = require('express');
var router = express.Router();
var jsonFileParser = require('jsonfile');
var regex = {
	matchFilenameDotJson: /\w+\.[jJ][sS][oO][nN]/,
	matchPathAfterJsonFile: /\w+\.[jJ][sS][oO][nN](.*)/,
}

/* home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*
* serve a json file e.g.
* /db.json/rows/1/cells/3
* would returns the 4th element of an array with key 'cells', 
* which is in the 2nd element of an array with the key 'rows' 
* in the object in the file db.json
*/
router.get(regex.matchFilenameDotJson, function(request, response, next) {
	console.log('request path is ' + request.path);
	var errStr;
	var jsonFile = findJsonFileInPath(request.path);
	serveJson(jsonFile, request, response);
});

var findJsonFileInPath = function(path) {
	return getLastMatch(path, regex.matchFilenameDotJson);
}

var serveJson = function(jsonFile, request, response) {
	var endpoint;
	var endpointObj;
	if (jsonFile) {
		jsonFileParser.readFile(jsonFile, function(err, contents) {
			if (!err) {
				endpoint = getJsonEndpoint(request.path);
				console.log('serveFile, json file: ' + jsonFile + ', endpoint: ' + endpoint);
				endpointObj = traverseJsonToEndpoint(contents, endpoint);
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
}

var getJsonEndpoint = function(path) {
	return getLastMatch(path, regex.matchPathAfterJsonFile);
}

var traverseJsonToEndpoint = function(jsonObj, endpoint) {
	var i;
	var childObj;
	var endpointObject = jsonObj;
	var endpointParts = endpoint.split('/');
	console.log('endpointParts = ' + endpointParts);
	for (i in endpointParts) {
		if (endpointParts[i]) {
			childObj = tryAsArrayIndex(endpointParts[i], endpointObject);
			if (!childObj) {
				childObj = tryAsKey(endpointParts[i], endpointObject);
			}
			if (childObj) {
				endpointObject = childObj;
			}
		}
	}
	console.log('endpointObject is now: ' + JSON.stringify(endpointObject,null,3));
	return childObj;
}

var tryAsArrayIndex = function(indexStr, array) {
	var arrayElement;
	var arrayIndex = parseInt(indexStr);
	if (arrayIndex) {
		console.log('tryAsArrayIndex, got int: ' + arrayIndex);
		try {
			return array[arrayIndex];
		} catch (err) {
			console.log(arrayIndex + ' was not a valid array index; ' + err);
		}
	} 
	return false;
}

var tryAsKey = function(key, object) {
	try {
		return object[key];
	} catch (err) {
		console.log(key + ' was not a valid object key; ' + err);
	}
	return false;
}


/*
* Note that getting the last match from a regex str.match() means that we will get either  
*  - the contents of the last set of parentheses, if there are any parentheses in the pattern
*  - otherwise the last match if a global /g is used in the pattern
*  - otherwise the first and only match reported
*/
var getLastMatch = function(string, pattern) {
	var match = '';
	var arrayFromPatternMatch = string.match(pattern);
	if (arrayFromPatternMatch && arrayFromPatternMatch.length > 0) {
		match = arrayFromPatternMatch[arrayFromPatternMatch.length-1];
	}
	return match;
}

module.exports = router;
