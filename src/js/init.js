console.time('all')
var MiniMongoose = require('../../mini-mongoose/mini-mongoose').MiniMongoose;
console.timeEnd('all')
console.time('db')
var MnM = new MiniMongoose();
console.timeEnd('db')

console.time('schema')
MnM.model('Brand',{

});
console.timeEnd('schema')
MnM.model('Car',{

});


console.time('loaded');
for (var i = 0; i < 10000; i++){

    MnM.addToCache('Brand', {
        _id: i+1,
        name: 'BMW',
        updated_at: new Date()
    });

    MnM.addToCache('Brand', {
        _id: i+2,
        name: 'Ford',
        updated_at: new Date()
    });

    MnM.addToCache('Car', {
        _id: i+3,
        name: 'Mustang',
        brand: i+1,
        brand_id: i+1,
        updated_at: new Date()
    });
}
console.timeEnd('loaded')

console.time('query1')
MnM.models.Car
.find({name:'Mustang'})
.populate({path: 'brand', model: 'Brand'})
.lean()
.limit(1)
.exec(function(err, results){
    console.log(results);
    console.timeEnd('query1')
});
