var express = require('express');
var router = express.Router();

var db = require('../db');

var MiniMongoose = require('../mini-mongoose/mini-mongoose').MiniMongoose;
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
        query.exec(function(err, results){
            var mediated = {
                results: results,
                modelName: options.modelName
            };
            cb(null, mediated);
        });
    }
};

/* GET home page. */
router.get('/', function(req, res) {

    var MnM = new MiniMongoose(options);

    var car = new Schema({
        brand: {type: String, ref: 'Brand'}
    });

    // load the schemas
    MnM.model('Brand', {});

    MnM.model('Car', car);

    MnM.models.Car
    .find({name:'Mustang'})
    //.populate({path: 'brand', model: 'Brand'})
    //.populate('brand')
    //.limit(1)
    .lean()
    .exec(function(err, results){
        res.render('index', {
            cache: false,
            title: 'minimongoose'
        });
        //console.log(results.toList().toJS());
    });

});

module.exports = router;
