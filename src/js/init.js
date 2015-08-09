
// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;

// var brandSchema = new Schema({
//     name: String,
//     updated_at: Date
// });

// brandSchema.pre('save', function(next){
//     this.updated_at = new Date();
//     next();
// });

var MiniMongoose = require('../../mini-mongoose/mini-mongoose').MiniMongoose;
var MnM = new MiniMongoose();

//MnM.model('Brand', brandSchema);

MnM.addToCache('Brand', '12125452', {
    _id: '12125452',
    name: 'BMW',
    updated_at: new Date()
});

MnM.addToCache('Brand', '12351234', {
    _id: '12351234',
    name: 'Ford',
    updated_at: new Date()
});

MnM.Brand
.find({name:'Ford'})
.limit(1)
.exec(function(err, results){
    console.log(results);
    MnM.Brand
    .find({name:'BMW'})
    .limit(1)
    .exec(function(err, results){
        console.log(results);
    });
});
