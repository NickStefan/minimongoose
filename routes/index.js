var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    var Car = req.db.Car
    debugger
    var mquery = require('mquery');
    mquery.Collection = require('../mini-mongoose/collection');

    var minimongo = require('minimongo');

    var LocalDb = minimongo.MemoryDb;

    var db = new LocalDb();

    db.addCollection('Brand');

    db.Brand.upsert([{
        name: 'BMW',
        updated_at: new Date()
    },{
        name: 'Ford',
        updated_at: new Date()
    }], function(err, doc){
        db.Brand.update = function(){};
        
        mquery(db.Brand)
        .find({name:'Ford'})
        .limit(1)
        .exec(function(err, results){
            console.log(results);
            res.render('index', { 
                cache: false, 
                title: 'minimongoose'
            });
        });
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
