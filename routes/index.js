'use strict';

var express = require('express');
var router = express.Router();
var endpointHelper = require('./json-endpoint-helper');

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
router.get(endpointHelper.regex.matchFilenameDotJson, function(request, response, next) {
	console.log('request path is ' + request.path);
	var errStr;
	var jsonFile = endpointHelper.findJsonFileInPath(request.path);
	endpointHelper.serveJson(jsonFile, request, response);
});

router.patch(endpointHelper.regex.matchUpdatePath, function(request, response, next) {
	console.log('request path is ' + request.path);
	var errStr;
	var jsonFile = endpointHelper.findJsonFileInPath(request.path);
	var updatePath = findUpdatePathAfterJsonFileName(request.path);
	updateJson(jsonFile, updatePath, request, response);
});

var findUpdatePathAfterJsonFileName = function(path) {
	endpointHelper.getLastMatch(path, endpointHelper.regex.matchUpdatePath);
}

var updateJson = function(jsonFile, updatePath, request, response) {
	// if (jsonFile) {
	// 	jsonFileParser.readFile(jsonFile, function(err, contents) {
	// 		// QQQQQQQQQQQQQQQQ get the file here
	// 		jsonFileParser.writeFile(jsonFile, function(err) {
	// 			// QQQQQQQQQQQQQ write the file here
	// 		}
	// 	}
	// 	// QQQQQQQQQQ better than the above would be to deal with streams or promises or something
	// }
}

module.exports = router;
