// index.js
var fs = require('fs');
//helper functions

function calculateSigmoid(x){	
	return (1/(1+Math.pow(Math.E,(-1*x))));
};

var NETWORK = function(config,cb)
{
	// 1. Initialize all the weights (including the threshold values) to random values in the range [1/−√fanin,1/√fanin],where f anin is the number of weights leading to the neuron.
		
		console.log(config);

		this.iN = config.iN || 26;
		this.oN = config.oN || 2;
		//number of neurons for the hidden input
		this.hN = config.hN || 10;
		this.hW = [];//Weights for hidden to output
		this.oW = [];//Weights for input to hidden
		this.hDelta = [];//deltaWeights for input to hidden
		this.oDelta = [];//deltaWeights for hidden to output

		//weights from the input to the hidden layer
		var range = 1/Math.sqrt(this.iN);
		for (var h = 0; h < this.hN; h++) 
		{
			var w = [];
			var delta = [];
			for (var i = 0; i <= this.iN; i++) 
			{
				var r = (Math.random()*range*2)-range;
				w.push(r);
				delta.push(0);//INIT the delta array
			};
			this.hW.push(JSON.parse(JSON.stringify(w)));
			this.hDelta.push(JSON.parse(JSON.stringify(delta)));
		};
		
		//weights from the hidden to the output layer
		for (var h = 0; h < this.oN; h++) 
		{
			var w = [];
			var delta = [];
			for (var i = 0; i <= this.hN; i++) //smaller OR EQUAL because of the bias weight that should be added (number 27)
			{
				var r = (Math.random()*range*2)-range;
				w.push(r);
				delta.push(0);
			};
			this.oW.push(JSON.parse(JSON.stringify(w)));
			this.oDelta.push(JSON.parse(JSON.stringify(delta)));
		};
	
	// 2. Initialize values for η (the learning rate), α (the momentum), ξ = 0 (the epoch counter) and ξmax (the maximum number of epochs)
	
		//learning rate
		this.n = config.n || 0.1;
		this.n = config.n || 0.1;
		//momentum
		this.a = config.a || 0.1;
		//max epoch
		this.eMax = config.eMax || 500;
		//current epoch
		this.e = 0;
		//set update rate for console.log
		this.updateRate = config.updateRate || 10;
};

NETWORK.prototype.train = function(trainingSet, targetOutputs, generalizationSet, generalizationOutputs, cb)
{
	var results = [];
	var at = 0;
	var ag = 0;
	var correctCount = 0;
	var incorrectCount = 0;
	var accuracy = 0;
	
//adding -1 to the end of every line in order to use the bias
	for (var i = 0; i < trainingSet.length; i++) {
		trainingSet[i].push(-1);
	};
	for (var i = 0; i < generalizationSet.length; i++) {
		generalizationSet[i].push(-1);
	};
// 3. Repeat until the maximum number of epochs (ξ = ξmax)
	while (this.e != this.eMax)
	{
		// (a) Set the training accuracy to zero (AT = 0)
		at = 0;
		ag = 0;
		// (b) Increment the epoch counter (ξ++)
		this.e++;
		// console.log('BEFORE',this.hW);
		// (c) For each pattern in the training set DT
		for (var k = 0; k < trainingSet.length; k++)
		{
			//calculating the activation from the input to the hidden layer
			var hRes = [];

			for (var i = 0; i < this.hN; i++) 
			{
				var sum = 0;
				
				for (var j = 0; j < trainingSet[k].length; j++) 
				{
					sum += (this.hW[i][j]*trainingSet[k][j]);
				};
				
				hRes.push(calculateSigmoid(sum));

			};

			//calculating the activation from the hidden layer to the output layer
			var oRes = [];

			for (var i = 0; i < this.oN; i++) 
			{
				var sum = 0;
				for (var j = 0; j < hRes.length; j++) 
				{
					sum += this.oW[i][j]*hRes[j];
				};
				oRes.push(calculateSigmoid(sum));
			};

			var aRes = [-1,-1];

			//v. Determine if the actual output, ak, should be 0 or 1,
			for (var i = 0; i < this.oN; i++) {
				if (oRes[i] >= 0.7) aRes[i] = 1;
				else if(oRes[i] <= 0.3) aRes[i] = 0;
			};

			correctCount = 0;
			incorrectCount = 0;
			accuracy = 0;

			//vi. Determine if the target output has been correctly predicted.
			for (var i = 0; i < aRes.length; i++) {
				// console.log(aRes[i],"vs",targetOutputs[k][i]);
				if (aRes[i] != targetOutputs[k][i]) incorrectCount++;
				if (aRes[i] == targetOutputs[k][i]) correctCount++;
			};
			// console.log("wrong",incorrectCount);
			// console.log("right",correctCount);
			if (!incorrectCount)
				accuracy = 1;

			at += accuracy;

			//viii. Calculate the error signal for each output
			var oError = [];
			
			for (var i = 0; i < this.oN; i++) {
				var error = -1*(targetOutputs[k][i]-oRes[i])*(1-oRes[i])*oRes[i];
				oError.push(error);
			};

			//Calculate the error signal for each hidden unit:
			var hError = [];

			for (var i = 0; i < this.hN; i++) 
			{
				var error = 0;
				
				for (var j = 0; j < this.oN; j++) 
				{
					error += (oError[j]*this.oW[j][i]*(1-hRes[i])*hRes[i]);
				};
				
				hError.push(error);
			};

			//x. Calculate the new weight values for the hidden-to-output weights (∆wkj = −η*δok*yj + α∆wkj; wkj+ = ∆wkj;)

			for (var o = 0; o < this.oN; o++) 
			{
				var error = oError[o];
				var delta = this.oDelta[o];
				var w = this.oW[o];
				
				for (var h = 0; h < this.hN; h++) 
				{
					var y = hRes[h];
					delta[h] = (-1*this.n*error*y)+(this.a*delta[h]);
					w[h] += delta[h];					
				};
			};

			//xi. Calculate the new weight values for the weights between hidden neuron j and input neuron i: ∆vji = −η*δyj*zi + α*∆vji; vji+ = ∆vji
			for (var h = 0; h < this.hN; h++) 
			{
				var error = hError[h];
				var delta = this.hDelta[h];
				var w = this.hW[h];
				
				for (var i = 0; i <= this.iN; i++) 
				{
					var z = trainingSet[k][i];
					delta[i] = (-1*this.n*error*z)+(this.a*delta[i]);
					w[i] += delta[i];					
				};
			};

			// console.log(this.hW);
			// console.log(this.hDelta);

		};

		//(d) Calculate the percentage correctly classified training patterns as AT = AT /PT ∗ 100, where PT is the total number of patterns in the training set.
		at = at/trainingSet.length*100;		
		// console.log('AFTER',this.hW);

		for (var k = 0; k < generalizationSet.length; k++)
		{
			//calculating the activation from the input to the hidden layer
			var hRes = [];

			for (var i = 0; i < this.hN; i++) 
			{
				var sum = 0;
				
				for (var j = 0; j < generalizationSet[k].length; j++) 
				{
					sum += (this.hW[i][j]*generalizationSet[k][j]);
				};
				
				hRes.push(calculateSigmoid(sum));
			};

			//calculating the activation from the hidden layer to the output layer
			var oRes = [];

			for (var i = 0; i < this.oN; i++) 
			{
				var sum = 0;
				for (var j = 0; j < hRes.length; j++) 
				{
					sum += this.oW[i][j]*hRes[j];
				};
				oRes.push(calculateSigmoid(sum));
			};

			var aRes = [-1,-1];

			//v. Determine if the actual output, ak, should be 0 or 1,
			for (var i = 0; i < this.oN; i++) {
				if (oRes[i] >= 0.7) aRes[i] = 1;
				else if(oRes[i] <= 0.3) aRes[i] = 0;
			};

			correctCount = 0;
			incorrectCount = 0;
			accuracy = 0;

			//vi. Determine if the output has been correctly predicted.
			for (var i = 0; i < aRes.length; i++) {
				if (aRes[i] != generalizationOutputs[k][i]) incorrectCount++;
				if (aRes[i] == generalizationOutputs[k][i]) correctCount++;
			};
			  // console.log("wrong",generalizationOutputs[k]);
			// console.log("right",correctCount);
			if (!incorrectCount)
				accuracy = 1;

			ag += accuracy;

		};

		ag = ag/generalizationSet.length*100;

		if (!(this.e % this.updateRate)) 
		{
			// console.log({epoch: this.e,at: {accuracy: at, size: trainingSet.length},ag:{accuracy: ag, size: generalizationSet.length}});
			// results.push(JSON.parse(JSON.stringify({epoch: this.e,at: {accuracy: at, size: trainingSet.length},ag:{accuracy: ag, size: generalizationSet.length}})));
			results.push(JSON.parse(JSON.stringify({epoch: this.e,at: at, ag:ag})));
		}

	}

	return results;
};

module.export = NETWORK;

var copy = function(arr)
{
	return JSON.parse(JSON.stringify(arr));
}


var targetData = require("./input_data.json");
var targetOutputs = require("./input_cat.json");; //[afr,eng]

var generalData = require("./general_data.json");
var generalOutputs = require("./general_cat.json");; //[afr,eng]

var thread = process.argv[2];
var n = [];
for (var A = 1; A < 2; A++) 
{
	n[A] = [];
	
		console.log("Started",A);
		for (var B = 1; B < 10; B++) 
		{
			fs.writeFile('results_' + thread + '_' + A + '_' + B + '.csv', '', function (err) {});
			n[A][B] = [];
			var avgAt = [];
			var avgAg = [];
			var epoch = [];
			for (var z = 0; z < 3; z++) 
			{
				n[A][B][z] = new NETWORK({a:(A/10),n:(B/10)},function(a){
					console.log(a);
				});

				results = n[A][B][z].train(copy(targetData),copy(targetOutputs),copy(generalData),copy(generalOutputs),function(results,settings){
				// n[A][B].train(copy(targetData),copy(targetOutputs),copy(targetData),copy(targetOutputs),function(results,settings){
					fs.appendFile('results_' + thread + '_' + A + '_' + B + '.csv', [z, settings.a, settings.n, settings.hN, results.join(',')].join(',') + ',\n', function (err) {});
				});

				for (var r = 0; r < results.length; r++) {
					avgAt[r] = avgAt[r] || 0;
					avgAg[r] = avgAg[r] || 0;
					avgAt[r] += results[r].at;
					avgAg[r] += results[r].ag;
					epoch[r] = results[r].epoch;
				};
			};
			
			for (var r = 0; r < avgAt.length; r++) {
				avgAt[r] /= avgAt.length;
				avgAg[r] /= avgAt.length;
				console.log([epoch[r],avgAt[r],avgAg[r]].join(','));
				fs.appendFile('results_' + thread + '_' + A + '_' + B + '.csv', [epoch[r],avgAt[r],avgAg[r]].join('\t') + '\n', function (err) {});
			};

		};
}; 
