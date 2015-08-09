
var MiniMongoose = require('../../mini-mongoose/mini-mongoose').MiniMongoose;
var MnM = new MiniMongoose();

MnM.addToCache('Brand', {
    _id: '12125452',
    name: 'BMW',
    updated_at: new Date()
});

MnM.addToCache('Brand', {
    _id: '12351234',
    name: 'Ford',
    updated_at: new Date()
});

MnM.addToCache('Car', {
    _id: '12351234',
    name: 'Mustang',
    brand: '12351234',
    brand_id: '12351234',
    updated_at: new Date()
});

MnM.Car
.find({name:'Mustang'})
.populate({path: 'brand', model: 'Brand'})
.limit(1)
.exec(function(err, results){
    console.log(results);
});
