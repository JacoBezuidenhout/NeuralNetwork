var xray = require('x-ray');
var fs = require('fs');
var afrikaans = [];
var english = [];

fs.writeFile('afrikaans.txt', '', function (err) {});
fs.writeFile('english.txt', '', function (err) {});


//Get Afrikaans Stories and count the characters
var afrikaans = function()
{
	for (var page = 400; page < 600; page+=5)
	{
	
		xray('http://www.woes.co.za/bydrae/kortverhale/'+page)
		.select([{
			$root: ".box-bold",
				content: {
					$root: '.subhead',
					link: 'a[href]',
					title: 'strong',
					body: 'p'
				}
		}])
		.run(function(err, object) 
		{
		    if (err)
		 	{
		 		console.log(err);
		 	}
		 	else
		 	{
			    for (var i = 0; i < object.length; i++) 
			    {
				    console.log(object[i].content.link);
					xray(object[i].content.link)
						.select([{
							$root: ".box-bold",
						  	body: 'article'
					}])
					.run(function(err, out) 
					{
						if (err)
					 	{
					 		console.log(err);
					 	}
					 	else
					 	{
						    for (var j = 0; j < out.length; j++) 
						    {
								var data = {};
								data.count = 0;
								data.inputs = [];
								for (var k = 0; k < 26; k++)
									data.inputs.push(0);

						    	if (out[j].body)
						    	{
						    		out[j].body = out[j].body.toLowerCase();
							    	for (var k = 0; k < out[j].body.length; k++) 
							    	{
							    		var ord = out[j].body.charCodeAt(k)-97;
							    		if (ord >= 0 && ord < 26)
							    		{
							    			data.count++;
							    			data.inputs[ord]++;
							    		};
							    	};
							    	
							    	for (var letter in data.inputs) 
							    		data.inputs[letter] = data.inputs[letter]/data.count;

							    		console.log(data.inputs);
							    	fs.appendFile('afrikaans.txt', JSON.stringify(data.inputs)+'\n', function (err) {
									});	
							    	// afrikaans.push(JSON.parse(JSON.stringify(data)));					    	
						    	};
							};
						}
						// console.log(afrikaans);
					});
		    	};
	    	};
		});
	};
};

afrikaans();

//Get English Stories and count the characters
var other = function()
{
	var afr = require("./afr.json");
	var eng = require("./eng.json");
	for (var j = 0; j < out.length; j++) 
    {
		var data = {};
		data.count = 0;
		data.inputs = [];
		for (var k = 0; k < 26; k++)
			data.inputs.push(0);

    	if (out[j].body)
    	{
    		out[j].body = out[j].body.toLowerCase();
	    	for (var k = 0; k < out[j].body.length; k++) 
	    	{
	    		var ord = out[j].body.charCodeAt(k)-97;
	    		if (ord >= 0 && ord < 26)
	    		{
	    			data.count++;
	    			data.inputs[ord]++;
	    		};
	    	};
	    	
	    	for (var letter in data.inputs) 
	    		data.inputs[letter] = data.inputs[letter]/data.count;

	    	fs.appendFile('afrikaans.txt', JSON.stringify(data.inputs)+'\n', function (err) {
	    		console.log(data.inputs);
			});	
	    	// afrikaans.push(JSON.parse(JSON.stringify(data)));					    	
    	};
	};

}

var english = function()
{
	for (var page = 20; page < 40; page++) 
	{
			
		xray('http://www.mibba.com/Stories/?page='+page)
			.select([{
				$root: ".item+.first",
				link: 'a[href]'
			}])
			.run(function(err, object) 
			{
			    
			    for (var i = 0; i < object.length; i++) 
			    {
				    console.log(object[i].link);
					xray(object[i].link)
						.select([{
							$root: "ol li",
						  	link: 'a[href]'
						}])
						.run(function(err, out) 
						{
						 	if (err)
						 	{
						 		console.log(err);
						 	}
						 	else
							{
							  	for (var i = 0; i < out.length; i++) 
							    {
								    console.log(out[i].link);
									xray(out[i].link)
										.select({
											$root: "body",
										  	body: '.content'
										})
										.run(function(err, body) 
										{
										 	if (err)
										 	{
										 		console.log(err);
										 	}
										 	else
											{
												var data = {};
												data.count = 0;
												data.inputs = [];
												for (var k = 0; k < 26; k++)
													data.inputs.push(0);

										    	if (body.body)
										    	{
										    		body.body = body.body.toLowerCase();
											    	for (var k = 0; k < body.body.length; k++) 
											    	{
											    		var ord = body.body.charCodeAt(k)-97;
											    		if (ord >= 0 && ord < 26)
											    		{
											    			data.count++;
											    			data.inputs[ord]++;
											    		};
											    	};
											    	
											    	for (var letter in data.inputs) 
											    		data.inputs[letter] = data.inputs[letter]/data.count;

											    	fs.appendFile('english.txt', JSON.stringify(data.inputs)+'\n', function (err) {
											    		console.log(data.inputs);
													});					    	
										    	};
											// console.log(english);
										    };
										});
							    };
							};

							// console.log(out);
						});
			    };
			  
				console.log(object);
			});
	};
};

english();