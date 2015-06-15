'use strict';

var express = require('express');
var router = express.Router();
var helper = require('./json-endpoint-helper');
var updateHelper = require('./update-helper');
var jsonFileParser = require('jsonfile');

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
	helper.serveJson(request, response);
});

router.post('/update', function(request, response, next) {
	console.log('method is ' + request.method + ', request path is ' + request.path + ', request.body is ' + JSON.stringify(request.body));
	updateHelper.updateJson(request, response);
});

module.exports = router;
