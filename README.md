# sserver
A simple server for json data - in progress and not ready for prime time

For example the path:

http://example.com/db.json/rows/1/cells/3

would return the 4th element of an array with key 'cells', 
which is in the 2nd element of an array with the key 'rows' 
in the json object
in the file db.json

And to update part of a json object here's an example html form showing the content, json-file and endpoint inputs

`<form enctype="application/x-www-form-urlencoded" action="/update" method="POST">`<br>
`		<input type="text" name="content" value="foo new">`<br>
`   <input type="text" name="json-file" value="db.json">`<br>
`   <input type="text" name="endpoint" value="rows/0/contents">`<br>
`		<input type="submit" value="Submit">`<br>
`	</form>`<br>
