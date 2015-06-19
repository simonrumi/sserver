'use strict';

var jsonFileParser = require('jsonfile');
var endpointHelper = require('./json-endpoint-helper');

var updateHelper = {

	updateJson : function(request, response) { /// QQQQ rename to updateHandler
		var i;
		var errStr;
		this.currentJsonFile = request.body['json-file'];

		console.log('updateJson: jsonFile = ' + this.currentJsonFile);

		if (this.currentJsonFile) {
			this.getLockThenUpdate(request, response);
		} else {
			errStr = 'No json file found:' + this.currentJsonFile;
			endpointHelper.displayError(errStr, response);
		}
	},

	currentJsonFile : '',

	getLockThenUpdate : function(request, response) {
		// TODO - this really needs to involve a listener that listens to decide if the file is free to lock
		try {
			this.lockJson(this.currentJsonFile);
			console.log('getLockThenUpdate: got lock, about to proceedWithUpdate for file ' + this.currentJsonFile);
			this.proceedWithUpdate(request, response, this.releaseLock);
		} catch (err) {
			endpointHelper.displayError(err, response);
		}
	},

	lockJson : function(jsonFile) {
		if (!jsonFile) {
			throw ('trying to lock a non existant json file');
		}
		this.fileLocks[this.currentJsonFile] = true;
	},

	fileLocks : {
		// 'example.json' : true,
		// 'someDb.json' : false,
	},

	proceedWithUpdate : function(request, response, callback) {
		var endpointParts;
		var helper = this;
		var updateEndpoint = request.body['endpoint'];
		var newContent = request.body['content'];
		console.log('\nproceedWithUpdate: helper.currentJsonFile is ' + helper.currentJsonFile);

		jsonFileParser.readFile(helper.currentJsonFile, function(err, contents) {
			console.log('\n proceedWithUpdate: read jsonFile and got contents: ' + JSON.stringify(contents));
			endpointParts = updateEndpoint.split('/');
			try {
				contents = helper.updateJsonAtEndpoint(endpointParts, contents, newContent);
				console.log('\n proceedWithUpdate: updated json to: ' + JSON.stringify(contents));
				helper.writeToJsonFile.call(helper, contents, callback);
				response.writeHead(200);
				response.end(JSON.stringify(contents,null,3));
			} catch (err2) {
				endpointHelper.displayError('Could not update ' + helper.currentJsonFile +
					' at endpoint ' + updateEndpoint + ': ' + err2, response);
			}
			// TODO better than the fs thing above would be to deal with streams or promises or something
		});
	},

	releaseLock : function(jsonFile) {
		// TODO this really needs to notify some listeners that the lock has been released
		this.unlockJson(jsonFile);
		this.currentJsonFile = '';
	},

	unlockJson : function(jsonFile) {
		this.fileLocks[jsonFile] = false;
	},

	updateJsonAtEndpoint : function(endpointPathParts, jsonObj, newContent) {
		var objectKey;
		var childObj;
		if (endpointPathParts.length === 1) {
			jsonObj[endpointPathParts[0]] = newContent; // we've reached the end of the endpoint path, so it's time to put in the newContent
			return jsonObj;
		} else {
			objectKey = endpointPathParts.shift(); // the current key is the first element in the array
			childObj = jsonObj[objectKey]; // use that key to get the childObj we're interested in (this works for arrays as well as key:value objects)
			childObj = this.updateJsonAtEndpoint(endpointPathParts, childObj, newContent); // recursively update the childObj
			jsonObj[objectKey] = childObj; // assign the updated childObj to the spot we got it from in the parent object
			return jsonObj;
		}
	},

	// TODO: terrible mess here re binding and sending json file around
	// probably the solution is this:
	// http://www.w3.org/wiki/JavaScript_best_practices#Avoid_globals
	//
	// also need to write tests to handle what happens when db.json is empty file (currrently crashes)

	writeToJsonFile : function(newContent, callback) {
		var originalObj = this;

		console.log('\n writeToJsonFile: jsonFile=' + originalObj.currentJsonFile + ', newContent=' + JSON.stringify(newContent));

		jsonFileParser.writeFile(originalObj.currentJsonFile, newContent, function(err) {
			if (!err) {
				console.log('writeToJsonFile: writing jsonFile wihtout error');
				callback.call(originalObj, originalObj.currentJsonFile);
				return true;
			} else {
				throw('Could not write to file ' + jsonfile + ' : ' + err);
			}
		});
	}
}

module.exports = updateHelper;