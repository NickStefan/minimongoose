var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    req.MnM.models.Car
    .find({name:'Mustang'})
    .populate('brand')
    .lean()
    .exec(function(err, results){
        res.render('index', {
            cache: false,
            title: 'minimongoose',
            serverResults: JSON.stringify(results.toJSON(), null, 4)
        });
    });

});

module.exports = router;
