
var MiniMongoose = require('../../mini-mongoose/mini-mongoose').MiniMongoose;
var MnM = new MiniMongoose();

MnM.model('Brand',{

});

MnM.model('Car',{

});

MnM.addToCache('Brand', {
    _id: '2',
    name: 'BMW',
    updated_at: new Date()
});

MnM.addToCache('Brand', {
    _id: '3',
    name: 'Ford',
    updated_at: new Date()
});

MnM.addToCache('Car', {
    _id: '1',
    name: 'Mustang',
    brand: '3',
    brand_id: '3',
    updated_at: new Date()
});

MnM.models.Car
.find({name:'Mustang'})
.populate({path: 'brand', model: 'Brand'})
.lean()
.limit(1)
.exec(function(err, results){
    console.log(results);
});
