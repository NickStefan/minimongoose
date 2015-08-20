var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    req.MnM.models.Car
    .find({name:'Mustang'})
    //.populate('brand')
    //.limit(1)
    .lean()
    .exec(function(err, results){
        res.render('index', {
            cache: false,
            title: 'minimongoose',
            results: results
        });
        next();
        //console.log(results);
    });

}, function(req, res, next){
    req.MnM.empty();
});

module.exports = router;
