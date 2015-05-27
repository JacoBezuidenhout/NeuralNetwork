// summarizeData.js
var fs = require('fs');
var file;
fs.writeFile('./summary.csv', '', function (err) {});
for (var k = 1; k < 10; k++) 
{

	fs.readFile('./results' + k + '.json', function (err, f) {
  		if (err) throw err;
 	 		console.log(file);
 	 	file = JSON.parse(f);
		for (var i = 0; i < file.length; i++) {
			for (var j = 0; j < file[i].results.length; j++) {
				fs.appendFile('./summary.csv', file[i].a+','+file[i].n+','+file[i].hN+','+file[i].results[j].epoch+','+file[i].results[j].at.accuracy+','+file[i].results[j].ag.accuracy+'\n', function (err) {});
				console.log(file[i].a+','+file[i].n+','+file[i].hN+','+file[i].results[j].epoch+','+file[i].results[j].at.accuracy+','+file[i].results[j].ag.accuracy);
			};
		};
	});

	// file = require('./results' + k + '.json');
};