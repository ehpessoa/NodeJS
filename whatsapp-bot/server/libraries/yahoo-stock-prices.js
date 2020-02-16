var request = require('request');

module.exports.getCurrentPrice = function(ticker, callback){

	request("https://finance.yahoo.com/quote/" + ticker + "/", function(err, res, body){

		if (err) {
			callback(err);
		}

		var price = 0;
		if ( body.indexOf("currentPrice")>0 ) {
			price = parseFloat(body.split("currentPrice")[1].split("fmt\":\"")[1].split("\"")[0]);
		}
		callback(null, price);

	});

};
