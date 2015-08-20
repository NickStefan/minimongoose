var express = require('express');
var router = express.Router();

function mongoMongooseMediator(req, res, cb){
	var params = req.body;
	var model = req.db[params.modelName];
	var query = model[params.operation](JSON.parse(params.match));

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
	query.lean().exec(cb);
}

router.post('/', function(req, res) {
	var modelName = req.body.modelName;
	mongoMongooseMediator(req, res, function(err, results){
		res.send(JSON.stringify({
			modelName: modelName,
			results: results
		}));
	});
});

module.exports = router;