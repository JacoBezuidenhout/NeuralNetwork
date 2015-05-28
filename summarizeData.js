// summarizeData.js
var fs = require('fs');
var file;
fs.writeFile('./summary.csv', '', function (err) {});
for (var k = 2; k < 10; k++) 
{
	for (var l = 1; l < 10; l++) 
	{

		fs.readFile('./results' + k + '_' + l + '.json', function (err, f) {
	  		if (err) throw err;
	 	 		console.log(f);

	 	 
		});
	}
	// file = require('./results' + k + '.json');
};