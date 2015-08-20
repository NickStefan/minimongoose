var db = require('./db');

var MiniMongoose = require('./build/mini-mongoose').MiniMongoose;
var Schema = MiniMongoose.Schema;

var options = {
    backendOrmMediator: function(match, options, cb){
        var model = db[options.modelName];
        var query = model[options.operation](options.match);

        if (options.fields){
            query = query.select(options.fields);
        }
        if (options.sort){
            query = query.sort(options.sort);
        }
        if (options.limit){
            query = query.limit(options.limit);
        }
        if (options.skip){
            query = query.skip(options.skip);
        }
        query.lean().exec(function(err, results){
            var mediated = {
                results: results,
                modelName: options.modelName
            };
            cb(null, mediated);
        });
    }
};

var MnM = new MiniMongoose(options);

var car = new Schema({
    brand: {type: String, ref: 'Brand'}
});

// load the schemas
MnM.model('Brand', {});

MnM.model('Car', car);

module.exports = {
	MnM: MnM
};