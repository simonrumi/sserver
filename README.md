# sserver
A simple server for json data - in progress and not ready for prime time

For example the path:

http://example.com/db.json/rows/1/cells/3

would returns the 4th element of an array with key 'cells', 
which is in the 2nd element of an array with the key 'rows' 
in the object in the file db.json
