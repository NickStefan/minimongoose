var express = require('express');
var router = express.Router();

var MiniMongoose = require('../mini-mongoose/mini-mongoose').MiniMongoose;
var MnM = new MiniMongoose();

/* GET home page. */
router.get('/', function(req, res) {
    // var Car = req.db.Car
    // // debugger
    // MnM.addToCache('Brand', '12125452', {
    //     _id: '12125452',
    //     name: 'BMW',
    //     updated_at: new Date()
    // });

    // MnM.addToCache('Brand', '12351234', {
    //     _id: '12351234',
    //     name: 'Ford',
    //     updated_at: new Date()
    // });

    // MnM.Brand
    // .find({name:'Ford'})
    // .limit(1)
    // .exec(function(err, results){
    //     console.log(results);
    //     MnM.Brand
    //     .find({name:'BMW'})
    //     .limit(1)
    //     .exec(function(err, results){
    //         console.log(results);
    //         res.render('index', { 
    //             cache: false, 
    //             title: 'minimongoose'
    //         });
    //     });
    //     // res.render('index', { 
    //     //     cache: false, 
    //     //     title: 'minimongoose'
    //     // });
    // });
    
    res.render('index', { 
        cache: false, 
        title: 'minimongoose'
    });

    // Car.find({name: '325i'})
    // .populate('brand')
    // .exec(function(err, results){
    //     console.log(results);
        
    //     res.render('index', { 
    //         cache: false, 
    //         title: 'minimongoose'
    //     });
    // });

});

module.exports = router;
