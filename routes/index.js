var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    req.MnM.models.Car
    .find({name:'Mustang'})
    //.populate({path: 'brand', model: 'Brand'})
    //.populate('brand')
    //.limit(1)
    .lean()
    .exec(function(err, results){
        res.render('index', {
            cache: false,
            title: 'minimongoose',
            results: results
        });
        console.log('bob', results);
    });

});

module.exports = router;
