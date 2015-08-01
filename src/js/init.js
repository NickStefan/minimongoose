var minimongo = require('minimongo');

var LocalDb = minimongo.MemoryDb;

var db = new LocalDb();

db.addCollection('Brand');
db.addCollection('Car');

db.Brand.upsert({
    name: 'BMW',
    updated_at: new Date()
}, function(brand){

    db.Car.upsert({
        name: '325i',
        brand: brand._id,
        brand_id: brand._id,
        updated_at: new Date()
    }, function (car){
        console.log(car);
    });
});
