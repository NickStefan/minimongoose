
var MiniMongoose = require('../../mini-mongoose/mini-mongoose').MiniMongoose;
//var Schema = require('mongoose').Schema;

var MnM = new MiniMongoose('http://localhost:3000/api/');

// var car = new Schema({
//     brand: {type: String, ref: 'Brand'}
// });

// load the schemas
MnM.model('Brand', {

});

MnM.model('Car', {});

// load the data
// MnM.addToCache('Brand', {
//     _id: '1',
//     name: 'BMW',
//     updated_at: new Date()
// });

// MnM.addToCache('Brand', {
//     _id: '2',
//     name: 'Ford',
//     updated_at: new Date()
// });

// MnM.addToCache('Car', {
//     _id: '3',
//     name: 'Mustang',
//     brand: '2',
//     brand_id: '2',
//     updated_at: new Date()
// });

// MnM.addToCache('Car', {
//     _id: '4',
//     name: '325i',
//     brand: '1',
//     brand_id: '1',
//     updated_at: new Date()
// });

// run some queries

window.MnM = MnM;

MnM.models.Car
.find({name:'Mustang'})
//.populate({path: 'brand', model: 'Brand'})
//.populate('brand')
.lean()
.limit(1)
.exec(function(err, results){
    console.log(results);
});
