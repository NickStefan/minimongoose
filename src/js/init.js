var MiniMongoose = require('../../mini-mongoose/mini-mongoose').MiniMongoose;
var Schema = require('mongoose').Schema;

var MnM = new MiniMongoose();

var car = new Schema({
    brand: {type: String, ref: 'Brand'}
});

// load the schemas
MnM.model('Brand', {});

MnM.model('Car', car);

//load the data
for (var i = 0; i < 50; i++){
    (function(){
        var r = Math.floor(Math.random() * 100000);

        MnM.addToCache('Brand',
            [
                {
                    _id: r + '11',
                    name: 'BMW',
                    updated_at: new Date()
                },
                {
                    _id: r + '12',
                    name: 'Ford',
                    updated_at: new Date()
                },
                {
                    _id: r + '13',
                    name: 'Other Ford',
                    updated_at: new Date()
                }
            ]
        );

        MnM.addToCache('Car',
            [
                {
                    _id: r + '13',
                    name: '325i',
                    brand: '11',
                    brand_id: '11',
                    updated_at: new Date()
                },
                {
                    _id: r + '21',
                    name: 'Mustang',
                    model: 'Mustang 5.0',
                    brand: r + '12',
                    brand_id: r + '12',
                    updated_at: new Date()
                },
                {
                    _id: r + '22',
                    name: 'Mustang',
                    model: 'Mustang GT',
                    brand: r + '13',
                    brand_id: r + '13',
                    updated_at: new Date()
                }
            ]
        );

    })();

}

// run some queries

window.MnM = MnM;

console.time('bob');
MnM.models.Car
.find({name:'Mustang'})
//.populate({path: 'brand', model: 'Brand'})
.populate('brand')
//.limit(1)
.lean()
.exec(function(err, results){
    console.timeEnd('bob')
});

console.time('bob2');
MnM.models.Car
.find({name:'Mustang'})
//.populate({path: 'brand', model: 'Brand'})
.populate('brand')
//.limit(1)
.lean()
.exec(function(err, results){
    console.timeEnd('bob2')
    console.time('bob3');
    MnM.models.Car
    .find({name:'Mustang'})
    //.populate({path: 'brand', model: 'Brand'})
    .populate('brand')
    //.limit(1)
    .lean()
    .exec(function(err, results){
        //console.log(results.toJS());
        console.timeEnd('bob3');
    });
});
