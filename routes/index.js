'use strict';

var express = require('express');
var router = express.Router();
var helper = require('./json-endpoint-helper');

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
router.get(helper.regex.matchFilenameDotJson, function(request, response, next) {
	console.log('GET request path is ' + request.path);
	var errStr;
	var jsonFile = helper.findJsonFileInPath(request.path);
	helper.serveJson(jsonFile, request, response);
});

router.post(helper.regex.matchUpdatePath, function(request, response, next) {
	console.log('POST request path is ' + request.path);
	var errStr;
	var jsonFile = helper.findJsonFileInPath(request.path);
	var updatePath = helper.getUpdatePathAfterJsonFileName(request.path);
	helper.updateJson(jsonFile, updatePath, request, response);
});

module.exports = router;
