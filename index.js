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
		this.oW = [];
		this.hW = [];

		//weights from the input to the hidden layer
		var range = 1/Math.sqrt(this.iN);
		for (var h = 0; h < this.hN; h++) 
		{
			var w = [];
			for (var i = 0; i <= this.iN; i++) 
			{
				var r = (Math.random()*range*2)-range;
				w.push(r);
			};
			this.hW.push(JSON.parse(JSON.stringify(w)));
		};
		
		//weights from the hidden to the output layer
		for (var h = 0; h < this.oN; h++) 
		{
			var w = [];
			for (var i = 0; i <= this.hN; i++) //smaller OR EQUAL because of the bias weight that should be added (number 27)
			{
				var r = (Math.random()*range*2)-range;
				w.push(r);
			};
			this.oW.push(JSON.parse(JSON.stringify(w)));
		};
	
	// 2. Initialize values for η (the learning rate), α (the momentum), ξ = 0 (the epoch counter) and ξmax (the maximum number of epochs)
	
		//learning rate
		this.n = config.n || 0.5;
		//momentum
		this.a = config.a || 0.5;
		//max epoch
		this.eMax = config.eMax || 5;
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
			for (var i = 0; i < aRes; i++) {
				if (aRes[i] != targetOutputs[k][i]) incorrectCount++;
				if (aRes[i] == targetOutputs[k][i]) correctCount++;
			};
			
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

			console.log(hError);

		};
	}
	cb(this)
};

module.export = NETWORK;

var n = new NETWORK({},function(a){
	console.log(a);
});

var data = [
[0.1361904761904762,0.02,0.04666666666666667,0.029523809523809525,0.13428571428571429,0.009523809523809525,0.008571428571428572,0.02095238095238095,0.06857142857142857,0.0009523809523809524,0.011428571428571429,0.045714285714285714,0.04,0.08190476190476191,0.06571428571428571,0.039047619047619046,0.0009523809523809524,0.0838095238095238,0.05333333333333334,0.04,0.01619047619047619,0.0038095238095238095,0.03142857142857143,0.0019047619047619048,0.009523809523809525,0],
[0.07979833101529903,0.01773296244784423,0.0003477051460361613,0.05006954102920723,0.18132823365785813,0.006606397774687065,0.032162726008344925,0.018949930458970792,0.07840751043115438,0.008344923504867872,0.0368567454798331,0.043636995827538244,0.027642559109874825,0.07510431154381085,0.06536856745479833,0.014082058414464534,0.0003477051460361613,0.06449930458970793,0.06675938803894298,0.056154381084840055,0.02121001390820584,0.018776077885952713,0.020166898470097356,0.00017385257301808066,0.015299026425591099,0.00017385257301808066]
];

var targetOutputs = [[0,1],[1,0]]; //[afr,eng]
n.train(data,targetOutputs,function(network){
	//console.log(network);
});