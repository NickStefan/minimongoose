var express = require('express');
var router = express.Router();

function mongoMongooseMediator(model, op, params, cb){
	var query = model[op](params.selector);
	if (params.fields){
		query = query.select(params.fields);
	}
	if (params.sort){
		query = query.sort(params.sort);
	}
	if (params.limit){
		query = query.limit(params.limit);
	}
	if (params.skip){
		query = query.skip(params.skip);
	}
	query.exec(cb);
}

router.get('/Car', function(req, res) {
	var Car = req.db.Car;
	mongoMongooseMediator(Car, 'find', req.params, function(err, results){ res.send(JSON.stringify(results)); });

});

router.get('/Brand', function(req, res) {
	var Brand = req.db.Brand;
	mongoMongooseMediator(Brand, 'find', req.params, function(err, results){ res.send(JSON.stringify(results)); });
});

module.exports = router;