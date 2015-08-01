var express = require('express');
var router = express.Router();

var Car = db.Car;
var Brand = db.Brand;

/* GET home page. */
router.get('/', function(req, res) {

    req.db.Car
    .find({name: '325i'})
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
