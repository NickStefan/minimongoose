var MiniMongoose = require('../../mini-mongoose/mini-mongoose').MiniMongoose;
var Schema = require('mongoose').Schema;

var MnM = new MiniMongoose();

var car = new Schema({
    brand: {type: String, ref: 'Brand'}
});

// load the schemas
MnM.model('Brand', {

});

MnM.model('Car', car);

//load the data
for (var i = 0; i < 1000; i++){
    var r = Math.floor(Math.random() * 100000);
MnM.addToCache('Brand', {
    _id: r,
    name: 'BMW',
    updated_at: new Date()
});

MnM.addToCache('Brand', {
    _id: r+1,
    name: 'Ford',
    updated_at: new Date()
});

MnM.addToCache('Car', {
    _id: r+2,
    name: 'Mustang',
    brand: '2',
    brand_id: '2',
    updated_at: new Date()
});

MnM.addToCache('Car', {
    _id: r+3,
    name: '325i',
    brand: '1',
    brand_id: '1',
    updated_at: new Date()
});

}

MnM.addToCache('Car', {
    _id: '2',
    name: 'Mustang',
    brand: '2',
    brand_id: '2',
    updated_at: new Date()
});

// run some queries

window.MnM = MnM;

console.time('bob');
MnM.models.Car
.find({_id: '2', name:'Mustang'})
//.populate({path: 'brand', model: 'Brand'})
.populate('brand')
.lean()
//.limit(1)
.exec(function(err, results){
    console.log(results);
    console.timeEnd('bob')
});
