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
// for (var i = 0; i < 1000; i++){
//     var r = Math.floor(Math.random() * 100000);
MnM.addToCache('Brand', {
    _id: '11',
    name: 'BMW',
    updated_at: new Date()
});

MnM.addToCache('Brand', {
    _id: '12',
    name: 'Ford',
    updated_at: new Date()
});

MnM.addToCache('Brand', {
    _id: '13',
    name: 'Other Ford',
    updated_at: new Date()
});

MnM.addToCache('Car', {
    _id: '13',
    name: '325i',
    brand: '11',
    brand_id: '11',
    updated_at: new Date()
});

MnM.addToCache('Car', {
    _id: '21',
    name: 'Mustang',
    model: 'Mustang 5.0',
    brand: '12',
    brand_id: '12',
    updated_at: new Date()
});

MnM.addToCache('Car', {
    _id: '22',
    name: 'Mustang',
    model: 'Mustang GT',
    brand: '13',
    brand_id: '13',
    updated_at: new Date()
});

// }

// run some queries

window.MnM = MnM;

console.time('bob');
MnM.models.Car
.find({name:'Mustang'})
//.populate({path: 'brand', model: 'Brand'})
.populate('brand')
.limit(1)
.lean()
.exec(function(err, results){
    console.log(results);
    console.timeEnd('bob')
});
