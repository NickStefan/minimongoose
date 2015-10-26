var MiniMongoose = require('../../../build/mini-mongoose').MiniMongoose;

var Schema = MiniMongoose.Schema;

var MnM = new MiniMongoose({
    resourcePrefix: '/api/'
});

var car = new Schema({
    brand: {type: Schema.ObjectId, ref: 'Brand'}
});

// load the schemas
MnM.model('Brand', {});

MnM.model('Car', car);

MnM.models.Car
.find({name:'Mustang'})
.populate('brand')
.lean()
.exec(function(err, results){
    document.querySelector('.results')
    .innerHTML = JSON.stringify(results, null, 4);
});

MnM.models.Car
.find({name:'Mustang'})
.populate('brand')
.lean()
.exec(function(err, results){
    document.querySelector('.results')
    .innerHTML = JSON.stringify(results, null, 4);
});
