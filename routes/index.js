var express = require('express');
var router = express.Router();

var MiniMongoose = require('../mini-mongoose/mini-mongoose').MiniMongoose;
var MnM = new MiniMongoose();

/* GET home page. */
router.get('/', function(req, res) {
    var Car = req.db.Car;

    // res.render('index', {
    //     cache: false,
    //     title: 'minimongoose'
    // });

    Car.find({name: 'Mustang'})
    .populate('brand')
    .exec(function(err, results){
        console.log(results);

        res.render('index', {
            cache: false,
            title: 'minimongoose'
        });
    });

});

module.exports = router;
