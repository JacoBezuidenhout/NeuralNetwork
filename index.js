// index.js

//helper functions

function calculateSigmoid(x){	
	return (1/(1+Math.pow(Math.E,(-1*x))));
};

var NETWORK = function(config,cb)
{
	// 1. Initialize all the weights (including the threshold values) to random values in the range [1/−√fanin,1/√fanin],where f anin is the number of weights leading to the neuron.
	
		this.iN = config.iN || 26;
		this.oN = config.oN || 2;
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
		this.n = config.n || 0.5;
		//momentum
		this.a = config.a || 0.5;
		//max epoch
		this.eMax = config.eMax || 2000;
		//current epoch
		this.e = 0;
		//number of neurons for the hidden input
};

NETWORK.prototype.train = function(trainingSet, targetOutputs, cb)
{
	var at = 0;


//adding -1 to the end of every line in order to use the bias
	for (var i = 0; i < trainingSet.length; i++) {
		trainingSet[i].push(-1);
	};
// 3. Repeat until the maximum number of epochs (ξ = ξmax)
	while (this.e != this.eMax)
	{
		// (a) Set the training accuracy to zero (AT = 0)
		at = 0;
		// (b) Increment the epoch counter (ξ++)
		this.e++;
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

			var correctCount = 0;
			var incorrectCount = 0;
			var accuracy = 0;

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
					w[h] += delta[i];					
				};
			};

			// console.log(this.hW);
			// console.log(this.hDelta);

		};

		//(d) Calculate the percentage correctly classified training patterns as AT = AT /PT ∗ 100, where PT is the total number of patterns in the training set.
		at = at/trainingSet.length*100;		
		console.log("Accuracy",at);
	}
	cb(this)
};

module.export = NETWORK;

var n = new NETWORK({},function(a){
	console.log(a);
});

var data = require("./input_data.json");

var targetOutputs = require("./input_cat.json");; //[afr,eng]
n.train(data,targetOutputs,function(network){
	//console.log(network);
});